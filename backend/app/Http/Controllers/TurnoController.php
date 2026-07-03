<?php

namespace App\Http\Controllers;

use App\Models\Turno;
use App\Models\AsignacionTurno;
use App\Models\Vacacion; // Para validar
use Illuminate\Http\Request;

class TurnoController extends Controller
{
    // Listar
    // Listar
    public function index()
    {
        return Turno::with('asignaciones.usuario')->get();
    }

    // Crear
    // Crear
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombre_turno' => 'required|string|max:255',
            'hora_entrada' => 'required|date_format:H:i',
            'hora_salida' => 'required|date_format:H:i|after:hora_entrada',
            'dias_semana' => 'required|string|max:255',
        ]);

        $turno = Turno::create($validatedData);
        return response()->json($turno, 201);
    }

    // Mostrar
    // Mostrar
    public function show($id)
    {
        return Turno::with('asignaciones.usuario')->findOrFail($id);
    }

    // Actualizar
    // Actualizar
    public function update(Request $request, $id)
    {
        $turno = Turno::findOrFail($id);

        $validatedData = $request->validate([
            'nombre_turno' => 'required|string|max:255',
            'hora_entrada' => 'required|date_format:H:i',
            'hora_salida' => 'required|date_format:H:i|after:hora_entrada',
            'dias_semana' => 'required|string|max:255',
        ]);

        $turno->update($validatedData);
        return response()->json($turno);
    }

    // Inactivar
    public function changeStatus($id)
    {
        $turno = Turno::findOrFail($id);
        $turno->activo = !$turno->activo;
        $turno->inactive_at = $turno->activo ? null : now();
        $turno->save();

        $message = $turno->activo ? 'Turno activado.' : 'Turno inactivado (No eliminado).';
        return response()->json(['message' => $message]);
    }

    // Asignar turno
    public function asignarTurno(Request $request, $id)
    {
        $turno = Turno::findOrFail($id);

        $validatedData = $request->validate([
            'usuario_id' => 'required|integer|exists:usuarios,id',
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
        ]);
        $estaEnVacaciones = Vacacion::where('usuario_id', $validatedData['usuario_id'])
            ->where('estado', 'aprobada')
            ->where('fecha_inicio', '<=', $validatedData['fecha_hasta'])
            ->where('fecha_fin', '>=', $validatedData['fecha_desde'])
            ->exists();

        if ($estaEnVacaciones) {
            return response()->json([
                'message' => 'Imposible asignar el turno. El empleado tiene vacaciones aprobadas que coinciden con esas fechas.'
            ], 422);
        }
        $asignacion = AsignacionTurno::create([
            'turno_id' => $turno->id,
            'usuario_id' => $validatedData['usuario_id'],
            'fecha_desde' => $validatedData['fecha_desde'],
            'fecha_hasta' => $validatedData['fecha_hasta'],
        ]);

        return response()->json([
            'message' => 'Turno asignado correctamente al usuario.',
            'asignacion' => $asignacion
        ], 201);
    }
}