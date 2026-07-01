<?php

use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\FlashSaleSimulationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FlashSaleController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');




Route::post('/flash-sale/purchase', [FlashSaleController::class, 'purchase'])->name('flash-sale.purchase');
