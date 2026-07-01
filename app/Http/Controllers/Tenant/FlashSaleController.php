<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessFlashSaleOrder;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class FlashSaleController extends Controller
{
    public function purchase(Request $request)
    {
        $productId = $request->input('product_id');
        $userId = auth()->id();

        $tenantId = app('currentTenant')->id;
        $redisStockKey = "tenant:{$tenantId}:product:{$productId}:stock";

        $remainingStock = Redis::decrby($redisStockKey, 1);

        if ($remainingStock < 0) {
            Redis::incrby($redisStockKey, 1);

            return response()->json([
                'status' => 'fail',
                'message' => 'Sorry, item out of stock!'
            ], 422);
        }

        $order = Order::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'status' => 'pending',
        ]);

        ProcessFlashSaleOrder::dispatch($userId, $productId, $tenantId, $order->id)
            ->onQueue('flash_sale');

        return response()->json([
            'status' => 'success',
            'message' => 'Order received! Processing your secure checkout...'
        ], 202);
    }
}
