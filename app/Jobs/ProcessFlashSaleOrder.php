<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
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

        Order::where('id', $this->orderId)->get();

        DB::transaction(function () {
            $affectedRows = Product::where('id', $this->productId)
                ->where('stock', '>', 0)
                ->decrement('stock');

            if ($affectedRows === 0) {
                throw new \Exception("Database inventory depletion for product {$this->productId}");
            }



            Order::where('id', $this->orderId)->update(['status' => 'completed']);
        });
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
