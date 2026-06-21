<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkspaceController;
// use Illuminate\Support\Facades\Artisan;
// use Spatie\Multitenancy\Models\Tenant;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/create-workspace', [WorkspaceController::class, 'create'])->name('workspace.create');
    Route::post('/create-workspace', [WorkspaceController::class, 'store'])->name('workspace.store');
});


// Route::get('/test', function () {
//     $tenant = Tenant::find(2);

//     $tenant->makeCurrent();

//     Artisan::call('migrate', [
//         '--database' => 'tenant',
//         '--path' => 'database/migrations/tenant',
//         '--force' => true,
//     ]);

// });
require __DIR__ . '/settings.php';
