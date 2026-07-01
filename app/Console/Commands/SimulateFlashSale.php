<?php

namespace App\Console\Commands;

use App\Jobs\ProcessFlashSaleOrder;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Pool;

#[Signature('app:simulate-flash-sale')]
#[Description('Command description')]
class SimulateFlashSale extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $url = rtrim($this->argument('url'), '/');
        $productId = $this->argument('product_id');
        $endpoint = "{$url}/api/checkout";

        $this->info("=== Starting 100-User HTTP Checkout Simulation ===");
        $this->comment("Target URL: {$endpoint}");
        $this->comment("Sending 100 requests concurrently...");

        $startTime = microtime(true);

        $userIds = User::take(100)->pluck('id')->toArray();
        $userCount = count($userIds);

        $responses = Http::pool(fn(Pool $pool) => array_map(
            fn($userId) => $pool->acceptJson()->post($endpoint, [
                'user_id' => $userId,
                'product_id' => $productId,
            ]),
            $userIds
        ));

        $duration = round(microtime(true) - $startTime, 2);
        $this->info("✓ All 100 requests completed in {$duration} seconds!");

        $successCount = 0;
        $failedCount = 0;

        foreach ($responses as $response) {
            if ($response->successful()) {
                $successCount++;
            } else {
                $failedCount++;
            }
        }

        $this->line("--------------------------------");
        $this->info("Success Responses (2xx): {$successCount}");
        $this->error("Failed/Blocked Responses: {$failedCount}");
        $this->line("--------------------------------");
        $this->comment("Now, check your database or queue to see how your backend handled the load!");
    }
}
