<?php

namespace App\Http\Controllers;

use App\Models\Cargo;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CargoController extends Controller
{
    
    // Listar todos los cargos
    public function index()
    {
        return Cargo::where('empresa_id', auth()->user()->empresa_id)->get();
    }

    
    // Crear
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombre' => 'required|string|max:255|unique:cargos',
            'descripcion' => 'nullable|string',
            'funciones' => 'nullable|string',
            'rol_id' => 'required|integer|exists:roles,id',
        ]);
        $data = array_merge($validatedData, [
            'empresa_id' => 1, 
            'activo' => true,
        ]);
        $cargo = Cargo::create($data);

        return response()->json($cargo, 201);
    }

    
    // Mostrar
    public function show($id)
    {
        return Cargo::findOrFail($id);
    }

    
    // Actualizar
    public function update(Request $request, $id)
    {
        $cargo = Cargo::findOrFail($id);
        $validatedData = $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('cargos')->ignore($cargo->id)],
            'descripcion' => 'nullable|string',
            'funciones' => 'nullable|string',
            'rol_id' => 'required|integer|exists:roles,id',
        ]);
        $cargo->update($validatedData);

        return response()->json($cargo, 200);
    }

    // Cambiar estado
    public function changeStatus($id)
    {
        $cargo = Cargo::findOrFail($id);
        $cargo->activo = !$cargo->activo;
        
        if (!$cargo->activo) {
            $cargo->fecha_inactivacion = now();
        } else {
            $cargo->fecha_inactivacion = null;
        }

        $cargo->save();

        $message = $cargo->activo ? 'Cargo activado correctamente.' : 'Cargo inactivado correctamente.';
        return response()->json(['mensaje' => $message], 200);
    }
}