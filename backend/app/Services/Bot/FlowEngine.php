<?php

namespace App\Services\Bot;

use App\Models\Flow;
use App\Models\FlowStep;

class FlowEngine
{
    public function __construct(
        protected SessionManager $session
    ) {}

    public function handle($contact, $message)
    {
        $message = strtolower(trim($message));

        $session = $this->session->get($contact);

        // 1. Si no hay sesión → buscar flow por keywords
        if (!$session) {
            return $this->startFlow($contact, $message);
        }

        // 2. continuar flow existente
        return $this->continueFlow($contact, $session, $message);
    }

    private function startFlow($contact, $message)
    {
        $flow = $this->matchFlow($message);

        if (!$flow) {
            return "No entiendo tu mensaje 🤔";
        }

        $firstStep = FlowStep::where('flow_id', $flow->_id)
            ->orderBy('step')
            ->first();

        if (!$firstStep) {
            return "Flow sin pasos configurados";
        }

        $this->session->create($contact, $flow->_id);

        return $this->replaceVars($firstStep->content, []);
    }

    private function continueFlow($contact, $session, $message)
    {
        $steps = FlowStep::where('flow_id', $session->flow_id)
            ->orderBy('step')
            ->get();

        $currentStep = $session->current_step;

        $step = $steps->firstWhere('step', $currentStep);

        // guardar respuesta si aplica
        if ($step && $step->save_as) {
            $this->session->saveData(
                $contact,
                $step->save_as,
                $message
            );
        }

        $nextStep = $steps->firstWhere('step', $currentStep + 1);

        if (!$nextStep) {
            $this->session->delete($contact);
            return "Gracias 👍 Hemos terminado.";
        }

        $this->session->updateStep($contact, $currentStep + 1);

        $sessionData = $this->session->get($contact)?->data ?? [];

        return $this->replaceVars($nextStep->content, $sessionData);
    }

    private function matchFlow($message)
    {
        return Flow::where('active', true)
            ->get()
            ->first(function ($flow) use ($message) {

                $keywords = $flow->keywords ?? [];

                if (is_string($keywords)) {
                    $keywords = [$keywords];
                }

                foreach ($keywords as $keyword) {
                    if (str_contains($message, strtolower($keyword))) {
                        return true;
                    }
                }

                return false;
            });
    }

    private function replaceVars($text, $data)
    {
        foreach ($data as $key => $value) {
            $text = str_replace("{{{$key}}}", $value, $text);
        }

        return $text;
    }
}