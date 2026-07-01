<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

class FlashSaleSimulationController extends Controller
{
    public function index()
    {
        // Fetch current baseline stats from the active tenant DB context
        $product = Product::first() ?? (object)['id' => 1, 'stock' => 10, 'name' => 'Sample Product'];
        $totalUsers = User::count();
        $completedOrders = Order::where('status', 'completed')->count();

        return Inertia::render('Shop/FlashSaleSimulation', [
            'initialStats' => [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'current_stock' => $product->stock,
                'total_users' => $totalUsers,
                'completed_orders' => $completedOrders,
                'default_url' => url('/flash-sale/purchase'),
            ]
        ]);
    }
    public function execute(Request $request)
    {
        $request->validate([
            'url' => 'required|string',
            'product_id' => 'required|integer',
            'concurrency' => 'required|integer|min:1|max:100',
        ]);

        $endpoint = parse_url($request->input('url'), PHP_URL_PATH) ?? '/flash-sale/purchase';
        $productId = $request->input('product_id');
        $concurrency = $request->input('concurrency');

        // Fetch real user IDs
        $userIds = User::take($concurrency)->pluck('id')->toArray();

        if (empty($userIds)) {
            return response()->json(['error' => 'No users found in database to simulate.'], 422);
        }

        // Store the original user so we can restore the dashboard session at the end
        $originalUser = Auth::user();

        $startTime = microtime(true);
        $metrics = [
            'duration_seconds' => 0,
            'total_sent' => $concurrency,
            'success_2xx' => 0,
            'failed_4xx_5xx' => 0,
            'detailed_logs' => [],
        ];

        $sessionToken = $request->hasSession() ? $request->session()->token() : null;


        foreach ($userIds as $index => $userId) {
            Auth::loginUsingId($userId);

            $subRequest = Request::create($endpoint, 'POST', [
                'product_id' => $productId,
                '_token' => $sessionToken,
            ]);
            $subRequest->headers->set('Accept', 'application/json');

            if ($request->hasSession()) {
                $subRequest->setLaravelSession($request->session());
            }

            try {
                $response = Route::dispatch($subRequest);

                $status = $response->getStatusCode();
                $isSuccess = $status >= 200 && $status < 300;

                if ($isSuccess) {
                    $metrics['success_2xx']++;
                } else {
                    $metrics['failed_4xx_5xx']++;
                }

                $data = json_decode($response->getContent(), true);

                $message = $data['message'] ?? ($isSuccess ? 'Job dispatched successfully' : 'Stock depleted / transaction aborted');

                $metrics['detailed_logs'][] = [
                    'timestamp' => now()->format('H:i:s.v'),
                    'request_index' => $index + 1,
                    'user_id' => $userId,
                    'status' => $status,
                    'success' => $isSuccess,
                    'message' => $message,
                ];
            } catch (\Exception $e) {
                $metrics['failed_4xx_5xx']++;
                $metrics['detailed_logs'][] = [
                    'timestamp' => now()->format('H:i:s.v'),
                    'request_index' => $index + 1,
                    'user_id' => $userId,
                    'status' => 500,
                    'success' => false,
                    'message' => 'Exception: ' . $e->getMessage(),
                ];
            }
        }

        if ($originalUser) {
            Auth::login($originalUser);
        } else {
            Auth::logout();
        }

        $metrics['duration_seconds'] = round(microtime(true) - $startTime, 4);

        return response()->json($metrics);
    }
}
