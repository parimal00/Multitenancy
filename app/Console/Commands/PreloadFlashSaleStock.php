<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;
use Spatie\Multitenancy\Models\Tenant;

#[Description('Command description')]
class PreloadFlashSaleStock extends Command
{
    protected $signature = 'flash-sale:preload {tenant_id} {product_id}';
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenantId = $this->argument('tenant_id');
        $productId = $this->argument('product_id');

        $tenant = Tenant::find($tenantId);

        if (!$tenant) {
            $this->error("Tenant ID {$tenantId} not found.");
            return Command::FAILURE;
        }

        // Make this tenant the current active tenant connection context
        $tenant->makeCurrent();

        // 2. Fetch the product directly out of the tenant database sandbox
        $product = Product::find($productId);

        if (!$product) {
            $this->error("Product ID {$productId} not found in Tenant {$tenant->name}'s database.");
            return Command::FAILURE;
        }

        // 3. Set the key inside Redis directly
        $redisStockKey = "tenant:{$tenantId}:product:{$productId}:stock";

        // set() overwrites whatever old value was there, cleanly priming the system
        Redis::set($redisStockKey, $product->stock);

        $this->info("⚡ Success! Preloaded '{$product->name}' (Stock: {$product->stock}) into Redis under key: {$redisStockKey}");

        // Return context back to clean state
        $tenant->forgetCurrent();

        return Command::SUCCESS;
    }
}
