<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Contact;
use App\Services\Bot\FlowEngine;

class BotController extends Controller
{
    public function webhook(Request $request, FlowEngine $engine)
    {
        $contact = Contact::firstOrCreate([
            'phone' => $request->phone
        ]);

        $reply = $engine->handle($contact, $request->message);

        return response()->json([
            'reply' => $reply
        ]);
    }
}