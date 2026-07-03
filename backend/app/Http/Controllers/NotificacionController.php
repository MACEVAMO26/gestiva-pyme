<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    // Listar
    public function index()
    {
        $misNotificaciones = Notificacion::where('usuario_id', Auth::id())
                                         ->orderBy('created_at', 'desc')
                                         ->get();
                                         
        return response()->json($misNotificaciones);
    }

    // Crear
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'usuario_id' => 'required|integer|exists:usuarios,id',
            'titulo' => 'required|string|max:255',
            'mensaje' => 'required|string',
        ]);

        $validatedData['leida'] = false;

        $notificacion = Notificacion::create($validatedData);
        return response()->json($notificacion, 201);
    }

    // Marcar como leída y borrar
    public function marcarLeida(int $id)
    {
        $notificacion = Notificacion::where('usuario_id', Auth::id())->findOrFail($id);
        $notificacion->delete();

        return response()->json([
            'message' => 'Notificación leída y eliminada del servidor para ahorrar espacio.'
        ]);
    }
}