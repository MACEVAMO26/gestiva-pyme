<?php

namespace App\Http\Controllers;

use App\Models\IaConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class IaConfigController extends Controller
{
    /**
     * Obtiene la configuración activa de IA
     */
    public function index()
    {
        $config = IaConfig::where('is_active', true)->first();
        
        if ($config) {
            return response()->json([
                'success' => true,
                'data' => [
                    'proveedor' => $config->proveedor,
                    'modo' => $config->modo,
                    // Por seguridad, no devolvemos la api key completa, solo un indicador o parcialmente ofuscada
                    'api_key' => '********' . substr(Crypt::decryptString($config->api_key), -4)
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => null
        ]);
    }

    /**
     * Guarda o actualiza la configuración de IA
     */
    public function store(Request $request)
    {
        $request->validate([
            'proveedor' => 'required|string|in:openai,gemini,claude,personalizada',
            'api_key' => 'nullable|string',
            'modo' => 'nullable|string|in:apagado,simple,avanzado'
        ]);

        $mantenerLlave = $request->boolean('mantener_llave');

        if (!$mantenerLlave && !$request->filled('api_key')) {
            return response()->json([
                'success' => false,
                'message' => 'Debes ingresar una API Key para habilitar la IA.'
            ], 422);
        }

        // Desactivamos todas las configuraciones previas
        IaConfig::where('is_active', true)->update(['is_active' => false]);

        $modo = $request->input('modo', 'apagado');

        // Buscamos si ya existe el proveedor para actualizarlo, si no lo creamos
        $config = IaConfig::where('proveedor', $request->proveedor)->first();

        $data = [
            'modo' => $modo,
            'is_active' => true
        ];

        if (!$mantenerLlave) {
            $data['api_key'] = Crypt::encryptString($request->api_key);
        }

        if ($config) {
            $config->update($data);
        } else {
            $config = IaConfig::create(array_merge($data, [
                'proveedor' => $request->proveedor,
            ]));
        }

        return response()->json([
            'success' => true,
            'message' => 'Configuración de IA guardada y activada correctamente.'
        ]);
    }
}
