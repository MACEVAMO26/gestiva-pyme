<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    // Trae todas las notificaciones del usuario logueado
    public function index()
    {
        $misNotificaciones = Notificacion::where('usuario_id', Auth::id())
                                         ->orderBy('created_at', 'desc')
                                         ->get();
                                         
        return response()->json($misNotificaciones);
    }

    // Crea una nueva notificacion en la base de datos
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

    // Elimina la notificacion tras ser leida para liberar espacio
    public function marcarLeida(int $id)
    {
        $notificacion = Notificacion::where('usuario_id', Auth::id())->findOrFail($id);
        $notificacion->delete();

        return response()->json([
            'message' => 'Notificación leída y eliminada del servidor para ahorrar espacio.'
        ]);
    }
}