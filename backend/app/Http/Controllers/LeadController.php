<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lead;

class LeadController extends Controller
{
    public function index()
    {
        return response()->json(Lead::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'telefono' => 'required|string|max:255',
            'correo' => 'required|email|max:255',
            'horario_llamada' => 'required|string|max:255',
            'mensaje' => 'nullable|string'
        ]);

        $lead = Lead::create([
            'nombre' => $validated['nombre'],
            'telefono' => $validated['telefono'],
            'correo' => $validated['correo'],
            'horario_llamada' => $validated['horario_llamada'] ?? null,
            'mensaje' => $validated['mensaje'] ?? null,
            'estado' => 'pendiente'
        ]);

        return response()->json($lead, 201);
    }

    public function update(Request $request, $id)
    {
        $lead = Lead::findOrFail($id);
        
        $validated = $request->validate([
            'estado' => 'required|in:pendiente,contactado,archivado'
        ]);

        $lead->estado = $validated['estado'];
        $lead->save();

        return response()->json($lead);
    }

    public function destroy($id)
    {
        $lead = Lead::findOrFail($id);
        $lead->delete();

        return response()->json(['message' => 'Lead eliminado correctamente.']);
    }
}
