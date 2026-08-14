<?php

namespace App\Services;

use App\Models\IaConfig;
use App\Models\IaChatHistory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Crypt;

class IaService
{
    /**
     * Procesa la petición a la IA, gestionando el historial si es modo avanzado.
     */
    public function processRequest($prompt, $modo = 'basico', $empresaId = null)
    {
        // Obtener la configuración activa
        $config = IaConfig::where('is_active', true)->first();

        if (!$config) {
            throw new \Exception('No hay ninguna IA configurada y activa en el sistema.');
        }

        // Desencriptar la API Key
        $apiKey = Crypt::decryptString($config->api_key);

        // Si es modo avanzado, recuperar el historial de chat
        $messages = [];

        if ($modo === 'avanzado') {
            // Contexto inicial del sistema para la IA
            $messages[] = [
                'role' => 'system',
                'content' => 'Eres Gestiva AI, un asistente virtual experto en ventas, contabilidad y gestión de servicios. Responde de manera profesional, concisa y amable.'
            ];

            // Traer los últimos 10 mensajes del historial para contexto
            $historial = IaChatHistory::where('empresa_id', $empresaId)
                ->orderBy('created_at', 'asc')
                ->take(10)
                ->get();

            foreach ($historial as $msg) {
                $role = $msg->rol === 'user' ? 'user' : 'assistant';
                $messages[] = [
                    'role' => $role,
                    'content' => $msg->mensaje
                ];
            }
        }

        // Añadir el nuevo mensaje del usuario
        $messages[] = [
            'role' => 'user',
            'content' => $prompt
        ];

        // Llamar a la API correspondiente según el proveedor
        if ($config->proveedor === 'openai') {
            $respuesta = $this->callOpenAI($apiKey, $messages);
        } elseif ($config->proveedor === 'gemini') {
            $respuesta = $this->callGemini($apiKey, $messages);
        } else {
            throw new \Exception('Proveedor de IA no soportado.');
        }

        // Si es modo avanzado, guardar el historial
        if ($modo === 'avanzado') {
            // Guardar pregunta del usuario
            IaChatHistory::create([
                'empresa_id' => $empresaId,
                'rol' => 'user',
                'mensaje' => $prompt,
                'modo' => 'avanzado'
            ]);

            // Guardar respuesta de la IA
            IaChatHistory::create([
                'empresa_id' => $empresaId,
                'rol' => 'assistant',
                'mensaje' => $respuesta,
                'modo' => 'avanzado'
            ]);
        }

        return $respuesta;
    }

    private function callOpenAI($apiKey, $messages)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-3.5-turbo', // Se puede configurar después
            'messages' => $messages,
        ]);

        if ($response->successful()) {
            return $response->json('choices.0.message.content');
        }

        throw new \Exception('Error al contactar con OpenAI: ' . $response->body());
    }

    private function callGemini($apiKey, $messages)
    {
        // Gemini API tiene un formato diferente para el historial
        // Adaptamos el array de messages al formato de Gemini
        $contents = [];
        foreach ($messages as $msg) {
            if ($msg['role'] === 'system') {
                continue; // Gemini maneja el system prompt de otra forma, lo omitiremos en versión simple o podemos insertarlo en el user prompt
            }
            $role = $msg['role'] === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $msg['content']]
                ]
            ];
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=" . $apiKey;
        
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, [
            'contents' => $contents,
        ]);

        if ($response->successful()) {
            return $response->json('candidates.0.content.parts.0.text');
        }

        throw new \Exception('Error al contactar con Gemini: ' . $response->body());
    }
}
