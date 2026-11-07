<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Healthcheck endpoint for Docker Compose and monitoring
Route::get('/health', function () {
    $dbStatus = 'disconnected';
    $dbError = null;

    try {
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Throwable $e) {
        $dbStatus = 'disconnected';
        $dbError = $e->getMessage();
    }

    return response()->json([
        'status' => ($dbStatus === 'connected') ? 'healthy' : 'warning',
        'service' => 'laravel-backend',
        'database' => $dbStatus,
        'error' => $dbError,
        'timestamp' => now()->toIso8601String(),
    ], ($dbStatus === 'connected') ? 200 : 200);
});

// Multipart/form-data update route (support for image updates via POST)
Route::post('products/{id}', [ProductController::class, 'update']);

// Standard RESTful API Resource routes
Route::apiResource('products', ProductController::class);
