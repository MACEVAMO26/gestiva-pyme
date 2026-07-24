<?php

namespace App\Http\Controllers;

use App\Models\Tarea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TareaController extends Controller
{
    // Para listar tareas dependiendo del rol del usuario
    public function index(Request $request)
    {
        $user = Auth::user();
        $rolNombre = $user->rol->nombre ?? '';

        $query = Tarea::with([
            'asignador:id,nombres,apellidos',
            'asignado:id,nombres,apellidos'
        ])->where('empresa_id', $user->empresa_id);

        if (in_array($rolNombre, ['Gerente', 'Jefe de Área'])) {
            $query->where(function ($q) use ($user) {
                $q->where('asignador_id', $user->id)
                  ->orWhere('asignado_id', $user->id);
            });
        } else {
            $query->where('asignado_id', $user->id);
        }

        return response()->json($query->get());
    }

    // Para asignar una nueva tarea
    public function store(Request $request)
    {
        $user = Auth::user();
        $rolNombre = $user->rol->nombre ?? '';

        if (!in_array($rolNombre, ['Gerente', 'Jefe de Área'])) {
            // Un empleado normal solo puede asignarse tareas a sí mismo
            if ($request->asignado_id != $user->id) {
                return response()->json(['message' => 'No autorizado para asignar tareas a otros'], 403);
            }
        }

        $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'asignado_id' => 'required|exists:usuarios,id',
        ]);

        $tarea = Tarea::create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'asignador_id' => $user->id,
            'asignado_id' => $request->asignado_id,
            'empresa_id' => $user->empresa_id,
        ]);

        return response()->json(['message' => 'Tarea creada con éxito', 'tarea' => $tarea], 201);
    }

    // Para actualizar el estado de una tarea
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        $tarea = Tarea::where('empresa_id', $user->empresa_id)->findOrFail($id);

        if ($tarea->asignador_id !== $user->id && $tarea->asignado_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'estado' => 'required|in:notificada,en_proceso,terminada',
        ]);

        $tarea->update([
            'estado' => $request->estado,
        ]);

        return response()->json(['message' => 'Estado actualizado', 'tarea' => $tarea]);
    }
}
