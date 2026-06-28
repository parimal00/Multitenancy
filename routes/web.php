<?php

use App\Http\Controllers\Tenant\FlashSaleController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkspaceController;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;
use Spatie\Multitenancy\Http\Middleware\EnsureValidTenantSession;
use Spatie\Multitenancy\Http\Middleware\NeedsTenant;
use Spatie\Multitenancy\Models\Tenant;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Middleware\SwitchToTenantDatabase;

// use Illuminate\Support\Facades\Artisan;
// use Spatie\Multitenancy\Models\Tenant;

// dd([
//     'current_host' => request()->getHost(),
//     'database_being_used' => DB::connection()->getDatabaseName(),
//     'tenant_record_exists' => \Spatie\Multitenancy\Models\Tenant::where('domain', request()->getHost())->exists(),
//     'all_registered_domains' => Tenant::pluck('domain')->toArray(),
// ]);

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/create-workspace', [WorkspaceController::class, 'create'])->name('workspace.create');
    Route::post('/create-workspace', [WorkspaceController::class, 'store'])->name('workspace.store');
});


Route::middleware([
    NeedsTenant::class,
    EnsureValidTenantSession::class,
    'auth',
    SwitchToTenantDatabase::class
])->group(function () {

    Route::get('/dude', function () {
        // Redis::set('tenant:2:product:1:stock', 100);
        $value = Redis::get('tenant:2:product:1:stock');
        dd($value);
    });

    Route::get('/products', [AdminProductController::class, 'index'])->name('admin.products.index');
    Route::post('/admin/products', [AdminProductController::class, 'store']);

    Route::get('/flash-sales', [AdminProductController::class, 'flashSalesIndex'])->name('admin.flash-sales.index');

    // The API endpoint remains targeted to your Redis processor
    Route::post('/flash-sale/purchase', [FlashSaleController::class, 'purchase'])->name('flash-sale.purchase');
});





require __DIR__ . '/settings.php';
