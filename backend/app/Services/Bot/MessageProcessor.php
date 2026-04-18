<?php

namespace App\Services\Bot;

use App\Repositories\ContactRepository;
use App\Repositories\MessageRepository;
use Illuminate\Support\Facades\Log;

class MessageProcessor
{
    public function __construct(
        private ContactRepository $contactRepo,
        private MessageRepository $messageRepo,
        private SessionManager $sessionManager,
        private FlowEngine $flowEngine
    ) {}

    /**
     * Procesa un mensaje entrante y retorna la respuesta
     * 
     * @param array $data ['phone', 'message', 'name', 'messageId']
     * @return array ['message', 'metadata']
     */
    public function process(array $data): array
    {
        $startTime = microtime(true);

        // 1. Obtener o crear contacto
        $contact = $this->contactRepo->findOrCreateByPhone($data['phone'], $data['name']);

        // 2. Guardar mensaje entrante (importante para historial)
        $this->messageRepo->create([
            'contact_id' => $contact->_id,
            'content' => $data['message'],
            'sender' => 'user',
            'external_id' => $data['messageId'] ?? null,
            'created_at' => now(),
        ]);

        // 3. Obtener o crear sesión
        $session = $this->sessionManager->getOrCreate($contact);

        // 4. PROCESAR con el motor de flujos
        $response = $this->flowEngine->handle($contact, $session, $data['message']);

        // 5. Guardar respuesta del bot
        $this->messageRepo->create([
            'contact_id' => $contact->_id,
            'content' => $response['message'],
            'sender' => 'bot',
            'created_at' => now(),
        ]);

        // 6. Métricas (importante para analytics)
        $processingTime = round((microtime(true) - $startTime) * 1000, 2);
        
        Log::info('Mensaje procesado', [
            'contact_id' => $contact->_id,
            'processing_time_ms' => $processingTime,
            'flow_used' => $response['metadata']['flow_name'] ?? 'none',
        ]);

        return [
            'message' => $response['message'],
            'metadata' => array_merge($response['metadata'] ?? [], [
                'processing_time_ms' => $processingTime,
                'contact_id' => $contact->_id,
            ]),
        ];
    }
}