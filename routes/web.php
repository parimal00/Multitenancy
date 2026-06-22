<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkspaceController;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Multitenancy\Http\Middleware\EnsureValidTenantSession;
use Spatie\Multitenancy\Http\Middleware\NeedsTenant;
use Spatie\Multitenancy\Models\Tenant;

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
    EnsureValidTenantSession::class
])->group(function () {

    Route::get('/dude', function () {
        dd(User::all());
    });
});

require __DIR__ . '/settings.php';
