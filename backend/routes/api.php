<?php
 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route; 

use App\Http\Controllers\Api\BotController;
use App\Http\Controllers\Api\FlowController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ContactController;

 
 Route::post('/bot/webhook', [BotController::class, 'webhook']);

 Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('flows', FlowController::class);
    Route::get('messages', [MessageController::class, 'index']);
    Route::get('contacts', [ContactController::class, 'index']);
});