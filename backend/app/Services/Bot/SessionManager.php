<?php

namespace App\Services\Bot;

use App\Models\Session;

class SessionManager
{
    public function get($contact)
    {
        return Session::where('contact_id', $contact->_id)->first();
    }

    public function create($contact, $flowId)
    {
        return Session::create([
            'contact_id' => $contact->_id,
            'flow_id' => $flowId,
            'current_step' => 1,
            'data' => [],
            'status' => 'active'
        ]);
    }

    public function updateStep($contact, $step)
    {
        Session::where('contact_id', $contact->_id)
            ->update(['current_step' => $step]);
    }

    public function saveData($contact, $key, $value)
    {
        $session = $this->get($contact);

        if (!$session) return;

        $data = $session->data ?? [];
        $data[$key] = $value;

        $session->update([
            'data' => $data
        ]);
    }

    public function delete($contact)
    {
        Session::where('contact_id', $contact->_id)->delete();
    }
}