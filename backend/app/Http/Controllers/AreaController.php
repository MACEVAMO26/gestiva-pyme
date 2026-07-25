<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Area;

class AreaController extends Controller
{
    // Trae las areas de la empresa del usuario
    public function index()
    {
        $empresaId = auth()->user()->empresa_id;
        return response()->json(Area::where('empresa_id', $empresaId)->get());
    }

    // Para guardar una nueva área
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        $area = Area::create([
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'empresa_id' => auth()->user()->empresa_id,
        ]);

        return response()->json($area, 201);
    }

    // Para actualizar un área
    public function update(Request $request, $id)
    {
        $area = Area::where('id', $id)
            ->where('empresa_id', auth()->user()->empresa_id)
            ->firstOrFail();

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'activo' => 'boolean'
        ]);

        $area->update($validated);

        return response()->json($area);
    }

    // Para inactivar o activar un área
    public function changeStatus($id)
    {
        $area = Area::where('id', $id)
            ->where('empresa_id', auth()->user()->empresa_id)
            ->firstOrFail();

        $area->activo = !$area->activo;
        $area->save();

        return response()->json(['message' => 'Estado del área actualizado', 'activo' => $area->activo]);
    }
}
