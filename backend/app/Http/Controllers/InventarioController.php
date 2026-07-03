<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use Illuminate\Http\Request;

class InventarioController extends Controller
{
    // Listar
   
    public function index()
    {
        return Inventario::with('producto')->get();
    }

    // Crear
   
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'producto_id' => 'required|integer|exists:productos,id',
            'cantidad_disponible' => 'required|integer|min:0',
            'cantidad_reservada' => 'nullable|integer|min:0',
            'ubicacion' => 'nullable|string|max:255',
            'lote' => 'nullable|string|max:255',
            'fecha_vencimiento' => 'nullable|date',
        ]);
        $validatedData['cantidad_reservada'] = $validatedData['cantidad_reservada'] ?? 0;

        $inventario = Inventario::create($validatedData);
        return response()->json($inventario, 201);
    }

    // Mostrar
    
    public function show($id)
    {
        return Inventario::with('producto')->findOrFail($id);
    }

    // Actualizar
   
    public function update(Request $request, $id)
    {
        $inventario = Inventario::findOrFail($id);

        $validatedData = $request->validate([
            'producto_id' => 'required|integer|exists:productos,id',
            'cantidad_disponible' => 'required|integer|min:0',
            'cantidad_reservada' => 'nullable|integer|min:0',
            'ubicacion' => 'nullable|string|max:255',
            'lote' => 'nullable|string|max:255',
            'fecha_vencimiento' => 'nullable|date',
        ]);

        $inventario->update($validatedData);
        return response()->json($inventario);
    }

    // Eliminar
    
    public function destroy($id)
    {
        $inventario = Inventario::findOrFail($id);
        
        $inventario->delete();

        return response()->json(['message' => 'Registro de inventario eliminado permanentemente.'], 200);
    }
}