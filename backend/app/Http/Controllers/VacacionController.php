<?php

namespace App\Http\Controllers;

use App\Models\Vacacion;
use Illuminate\Http\Request;

class VacacionController extends Controller
{
    // Trae la lista de todas las vacaciones registradas
    public function index()
    {
        return Vacacion::with('usuario')->get();
    }

    // Registra una nueva solicitud de vacaciones
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'usuario_id' => 'required|integer|exists:usuarios,id',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'tipo' => 'required|in:Disfrute Legal,Colectivas,Anticipadas',
            'observaciones' => 'nullable|string',
        ]);
        $validatedData['estado'] = 'pendiente';

        $vacacion = Vacacion::create($validatedData);
        return response()->json($vacacion, 201);
    }

    // Muestra el detalle de una solicitud de vacaciones
    public function show($id)
    {
        return Vacacion::with('usuario')->findOrFail($id);
    }

    // Modifica una solicitud de vacaciones que sigue pendiente
    public function update(Request $request, $id)
    {
        $vacacion = Vacacion::findOrFail($id);

        if ($vacacion->estado !== 'pendiente') {
            return response()->json(['message' => 'No puedes modificar una solicitud que ya fue respondida.'], 403);
        }

        $validatedData = $request->validate([
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'tipo' => 'required|in:Disfrute Legal,Colectivas,Anticipadas',
            'observaciones' => 'nullable|string',
        ]);

        $vacacion->update($validatedData);
        return response()->json($vacacion);
    }

    // Aprueba o rechaza una solicitud de vacaciones
    public function responderSolicitud(Request $request, $id)
    {
        $vacacion = Vacacion::findOrFail($id);

        $validatedData = $request->validate([
            'estado' => 'required|in:aprobada,rechazada',
            'justificacion_respuesta' => 'required_if:estado,rechazada|string|nullable' 
        ]);

        $vacacion->estado = $validatedData['estado'];
        $vacacion->justificacion_respuesta = $validatedData['justificacion_respuesta'] ?? null;
        $vacacion->save();

        return response()->json([
            'message' => 'Solicitud ' . $vacacion->estado . ' correctamente.',
            'vacacion' => $vacacion
        ]);
    }
}