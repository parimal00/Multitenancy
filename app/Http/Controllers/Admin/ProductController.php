<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;

class ProductController extends Controller
{
    // Render the dashboard data payload
    public function index()
    {
        $tenantId = app('currentTenant')->id;

        $products = Product::latest()->get()->map(function ($product) use ($tenantId) {
            $redisStock = 0;
            if ($product->is_flash_sale) {
                $redisStock = (int) Redis::get("tenant:{$tenantId}:product:{$product->id}:stock") ?? 0;
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'price' => (float) $product->price,
                'stock' => $product->stock,
                'is_flash_sale' => (bool) $product->is_flash_sale,
                'redis_stock' => $redisStock
            ];
        });

        return Inertia::render('Admin/Products/Index', [
            'products' => $products
        ]);
    }

    public function flashSalesIndex()
    {
        $tenantId = app('currentTenant')->id;
        $flashProducts = Product::where('is_flash_sale', true)
            ->where('flash_sale_stock', '>', 0)
            ->get()
            ->map(function ($product) use ($tenantId) {
                $redisKey = "tenant:{$tenantId}:product:{$product->id}:stock";

                $realTimeStock = Redis::get($redisKey);

                if ($realTimeStock === null) {
                    $realTimeStock = $product->flash_sale_stock;
                    Redis::set($redisKey, $realTimeStock);
                }

                $realTimeStock = 20;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => (float) ($product->price_cents / 100),
                    'flash_sale_stock' => $realTimeStock,
                ];
            });

        return Inertia::render('Shop/FlashSales', [
            'initialProducts' => $flashProducts
        ]);
    }

    public function store(Request $request)
    {
        // 1. Authorize the user (Simple check for now, can be moved to middleware)
        if (!auth()->user() || !auth()->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        // 2. Validate incoming product data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price_cents' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_flash_sale' => 'boolean',
            'flash_sale_stock' => 'required_if:is_flash_sale,true|integer|min:0',
        ]);

        // 3. Persist to MySQL under the current tenant context
        $product = Product::create([
            'name' => $validated['name'],
            'price_cents' => $validated['price_cents'],
            'stock' => $validated['stock'],
            'is_flash_sale' => $validated['is_flash_sale'] ?? false,
            'flash_sale_stock' => $validated['is_flash_sale'] ? $validated['flash_sale_stock'] : 0,
        ]);

        // 4. STRATEGY 1: If it's a flash sale, prime the high-speed Redis memory buffer instantly
        if ($product->is_flash_sale) {
            $tenantId = app('currentTenant')->id;
            $redisStockKey = "tenant:{$tenantId}:product:{$product->id}:stock";

            Redis::set($redisStockKey, $product->flash_sale_stock);
        }

        return redirect()->back()->with('success', 'Product created successfully!');
    }
}
