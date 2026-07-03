<?php

namespace App\Http\Controllers;

use App\Models\Permiso;
use Illuminate\Http\Request;

class PermisoController extends Controller
{
    // Listar
    
    public function index()
    {
        return Permiso::all();
    }

    // Crear
    
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'rol_id' => 'required|integer|exists:roles,id',
            'modulo' => 'required|string|max:255',
            'puede_ver' => 'required|boolean',
            'puede_crear' => 'required|boolean',
            'puede_editar' => 'required|boolean',
            'puede_inactivar' => 'required|boolean',
        ]);
        $permiso = Permiso::create($validatedData);

        return response()->json($permiso, 201);
    }

    // Mostrar
    
    public function show($id)
    {
        return Permiso::findOrFail($id);
    }

    // Actualizar
    
    public function update(Request $request, $id)
    {
        $permiso = Permiso::findOrFail($id);
        $validatedData = $request->validate([
            'rol_id' => 'required|integer|exists:roles,id',
            'modulo' => 'required|string|max:255',
            'puede_ver' => 'required|boolean',
            'puede_crear' => 'required|boolean',
            'puede_editar' => 'required|boolean',
            'puede_inactivar' => 'required|boolean',
        ]);
        $permiso->update($validatedData);

        return response()->json($permiso, 200);
    }

    // Eliminar
    
    public function destroy($id)
    {
        $permiso = Permiso::findOrFail($id);
        $permiso->delete();

        return response()->json(null, 204);
    }
}