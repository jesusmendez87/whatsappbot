<?php
namespace Database\Seeders;
use App\Models\FlowStep;
use Illuminate\Database\Seeder;

 
class FlowStepSeeder extends Seeder
{
    public function run()
    {
        FlowStep::insert([
            [ 
                'flow_id' => 'horario',
                'step' => 1,
                'type' => 'message',
                'content' => "🕐 Horario:\nL-V 8:00 - 17:00",
                'save_as' => null
            ],
            [
                'flow_id' => 'disponibilidad',
                'step' => 1,
                'type' => 'message',
                'content' => "🔍 ¿Buscas una pieza?",
                'save_as' => null
            ],
            [
                'flow_id' => 'precio',
                'step' => 1,
                'type' => 'message',
                'content' => "💰 Precios según pieza",
                'save_as' => null
            ],
            [
                'flow_id' => 'envio',
                'step' => 1,
                'type' => 'message',
                'content' => "📦 Envíos 24-48h",
                'save_as' => null
            ],
            [
                'flow_id' => 'garantia',
                'step' => 1,
                'type' => 'message',
                'content' => "✅ 12 meses garantía",
                'save_as' => null
            ],
            [
                'flow_id' => 'recogida',
                'step' => 1,
                'type' => 'message',
                'content' => "📍 Recogida en Ciudad Real",
                'save_as' => null
            ],
            [
                'flow_id' => 'pago',
                'step' => 1,
                'type' => 'message',
                'content' => "💳 Bizum, transferencia, efectivo",
                'save_as' => null
            ],
            [
                'flow_id' => 'taller',
                'step' => 1,
                'type' => 'message',
                'content' => "🔧 No hacemos instalación",
                'save_as' => null
            ],
            [
                'flow_id' => 'despiece',
                'step' => 1,
                'type' => 'message',
                'content' => "🚗 Baja de vehículo → link WhatsApp",
                'save_as' => null
            ],
            [
                'flow_id' => 'contacto',
                'step' => 1,
                'type' => 'message',
                'content' => "📞 Teléfono / Email / Dirección",
                'save_as' => null
            ],
        ]);
    }
}