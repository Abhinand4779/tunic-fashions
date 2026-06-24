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
use App\Http\Controllers\ProductReviewController;

// Public Routes
Route::get('/migrate', function() {
    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
    return response()->json(['message' => 'Database migration completed successfully!']);
});
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);

// Public Shipping Rates
Route::get('/shipping', [\App\Http\Controllers\ShippingRateController::class, 'index']);

// New Public Routes for CMS & Navigation
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/offers/visible', [OfferController::class, 'visible']);
Route::get('/settings', [SettingController::class, 'index']);
Route::post('/analytics/visit', [AnalyticsController::class, 'visit']);

// Public Review Routes
Route::get('/reviews', [ProductReviewController::class, 'indexPublic']);
Route::post('/reviews', [ProductReviewController::class, 'store']);

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
    Route::put('/admin/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::put('/admin/orders/{id}/tracking', [AdminOrderController::class, 'updateTracking']);
    Route::get('/admin/orders/{id}/invoice', [AdminOrderController::class, 'invoice']);

    // Admin Shipping Rates
    Route::post('/admin/shipping', [\App\Http\Controllers\ShippingRateController::class, 'store']);
    Route::delete('/admin/shipping/{id}', [\App\Http\Controllers\ShippingRateController::class, 'destroy']);

    // Admin Settings (CMS) & Analytics
    Route::post('/admin/settings', [SettingController::class, 'update']);
    Route::get('/admin/analytics', [AnalyticsController::class, 'dashboard']);

    // Admin Reviews
    Route::get('/admin/reviews', [ProductReviewController::class, 'indexAdmin']);
    Route::put('/admin/reviews/{id}/status', [ProductReviewController::class, 'updateStatus']);
    Route::delete('/admin/reviews/{id}', [ProductReviewController::class, 'destroy']);
});

Route::get('/debug-admin', function() { return App\Models\AdminUser::all(); });
