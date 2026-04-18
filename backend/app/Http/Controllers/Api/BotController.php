<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Bot\MessageProcessor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class BotController extends Controller
{
    public function __construct(
        private MessageProcessor $messageProcessor
    ) {}

    /**
     * Webhook principal que recibe mensajes del bot Node.js
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            // Validar entrada
            $validator = Validator::make($request->all(), [
                'phone' => 'required|string',
                'message' => 'required|string|max:4000',
                'name' => 'nullable|string|max:255',
                'messageId' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'ok' => false,
                    'reply' => 'Error: Datos inválidos',
                    'errors' => $validator->errors()
                ], 400);
            }

            // Log para debugging (importante para monitoreo)
            Log::info('Mensaje recibido', [
                'phone' => $request->phone,
                'message_length' => strlen($request->message),
                'timestamp' => now()
            ]);

            // PROCESAR el mensaje (aquí está la magia)
            $response = $this->messageProcessor->process([
                'phone' => $request->phone,
                'message' => $request->message,
                'name' => $request->name,
                'messageId' => $request->messageId,
            ]);

            return response()->json([
                'ok' => true,
                'reply' => $response['message'],
                'metadata' => $response['metadata'] ?? [],
            ]);

        } catch (\Exception $e) {
            // Log crítico para errores
            Log::error('Error en webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'phone' => $request->phone ?? 'unknown'
            ]);

            // Respuesta de fallback (nunca dejar al cliente sin respuesta)
            return response()->json([
                'ok' => false,
                'reply' => '❌ Lo siento, hubo un error temporal. Un agente te contactará pronto.',
            ], 500);
        }
    }

    /**
     * Endpoint para verificar estado del servicio
     * Útil para monitoreo (health checks)
     */
    public function health(): JsonResponse
    {
        try {
            // Verificar conexión a MongoDB
            \DB::connection('mongodb')->getDatabaseName();
            
            return response()->json([
                'status' => 'ok',
                'timestamp' => now(),
                'database' => 'connected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}