<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Spatie\Multitenancy\Jobs\TenantAware;
use Spatie\Multitenancy\Models\Tenant;

class ProcessFlashSaleOrder implements ShouldQueue, TenantAware
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected int $userId,
        protected int $productId,
        protected int $tenantId,
        protected int $orderId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $tenant = Tenant::find($this->tenantId);
        $tenant->makeCurrent();

        $stockWasDecremented = DB::transaction(function () {
            $affectedRows = Product::where('id', $this->productId)
                ->where('flash_stock', '>', 0)
                ->decrement('flash_stock');

            if ($affectedRows > 0) {
                Order::where('id', $this->orderId)->update(['status' => 'completed']);
                return true;
            }

            return false;
        });

        if (!$stockWasDecremented) {
            Log::info("Graceful checkout rejection: Stock depleted in database", [
                'tenant_id' => $this->tenantId,
                'product_id' => $this->productId,
                'order_id' => $this->orderId
            ]);

            Order::where('id', $this->orderId)->update([
                'status' => 'failed',
                'failure_reason' => 'out_of_stock'
            ]);

            Redis::set("tenant:{$this->tenantId}:product:{$this->productId}:flash_stock", 0);

            return;
        }
    }

    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Redis::incr("tenant:{$this->tenantId}:product:{$this->productId}:flash_stock");

        $tenant = Tenant::find($this->tenantId);
        if ($tenant) {
            $tenant->makeCurrent();
            Order::where('id', $this->orderId)->update(['status' => 'failed']);
        }
    }
}
