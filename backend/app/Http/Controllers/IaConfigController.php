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
            'proveedor' => 'required|string|in:openai,gemini',
            'api_key' => 'required|string'
        ]);

        // Desactivamos todas las configuraciones previas
        IaConfig::where('is_active', true)->update(['is_active' => false]);

        // Buscamos si ya existe el proveedor para actualizarlo, si no lo creamos
        $config = IaConfig::where('proveedor', $request->proveedor)->first();

        if ($config) {
            $config->update([
                'api_key' => Crypt::encryptString($request->api_key),
                'is_active' => true
            ]);
        } else {
            $config = IaConfig::create([
                'proveedor' => $request->proveedor,
                'api_key' => Crypt::encryptString($request->api_key),
                'is_active' => true
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Configuración de IA guardada y activada correctamente.'
        ]);
    }
}
