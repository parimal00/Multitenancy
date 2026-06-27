<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Spatie\Multitenancy\Models\Tenant;

class ProcessFlashSaleOrder implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected int $userId,
        protected int $productId,
        protected int $tenantId
    ) {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $tenant = Tenant::find($this->tenantId);
        $tenant->makeCurrent();

        Order::create([
            'user_id' => $this->userId,
            'product_id' => $this->productId,
            'status' => 'completed',
        ]);

        Product::where('id', $this->productId)->decrement('stock');
    }
}
