<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessFlashSaleOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class FlashSaleController extends Controller
{
    public function purchase(Request $request)
    {
        $productId = $request->input('product_id');
        $userId = auth()->id(); // Simulated or authenticated load-test user

        // Tenant-scoped Redis cache key (e.g., tenant:1:product:5:stock)
        $tenantId = app('currentTenant')->id;
        $redisStockKey = "tenant:{$tenantId}:product:{$productId}:stock";

        // Atomic decrement operation via Redis
        // decrby returns the remaining stock integer immediately after reducing it
        $remainingStock = Redis::decrby($redisStockKey, 1);

        // If the remaining stock drops below zero, it means we are sold out!
        if ($remainingStock < 0) {
            // Revert the decrement so stock doesn't stay negative
            Redis::incrby($redisStockKey, 1);

            return response()->json([
                'status' => 'fail',
                'message' => 'Sorry, item out of stock!'
            ], 422);
        }

        // Dispatch the database insertion job to the Redis queue asynchronously
        ProcessFlashSaleOrder::dispatch($userId, $productId, $tenantId)
            ->onQueue('flash_sale');

        return response()->json([
            'status' => 'success',
            'message' => 'Order received! Processing your secure checkout...'
        ], 202);
    }
}
