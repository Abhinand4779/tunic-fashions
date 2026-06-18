<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminOrderController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\AnalyticsController;

// Public Routes
Route::get('/migrate', function() {
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    return response()->json(['message' => 'Database migration completed successfully!']);
});
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);

// New Public Routes for CMS & Navigation
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/offers/visible', [OfferController::class, 'visible']);
Route::get('/settings', [SettingController::class, 'index']);
Route::post('/analytics/visit', [AnalyticsController::class, 'visit']);

// Admin Authentication
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// Protected admin routes
Route::middleware('auth:sanctum')->group(function () {
    // Admin Products & Categories & Offers
    Route::post('/admin/products', [ProductController::class, 'store']);
    Route::put('/admin/products/{product}', [ProductController::class, 'update']);
    Route::apiResource('/admin/categories', CategoryController::class);
    Route::apiResource('/admin/offers', OfferController::class);
    
    // Admin Orders
    Route::get('/admin/orders', [AdminOrderController::class, 'index']);
    Route::put('/admin/orders/{id}/tracking', [AdminOrderController::class, 'updateTracking']);
    Route::get('/admin/orders/{id}/invoice', [AdminOrderController::class, 'invoice']);

    // Admin Settings (CMS) & Analytics
    Route::post('/admin/settings', [SettingController::class, 'update']);
    Route::get('/admin/analytics', [AnalyticsController::class, 'dashboard']);
});
