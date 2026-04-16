<?php
namespace App\Http\Controllers\Api;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Contact;

public function webhook(Request $request)
{
    $engine = new \App\Services\Bot\FlowEngine();

    $contact = Contact::firstOrCreate([
        'phone' => $request->phone
    ]);

    $reply = $engine->handle($contact, $request->message);

    return response()->json([
        'reply' => $reply
    ]);
}