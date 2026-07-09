<?php

namespace App\Http\Controllers;

use App\Models\Permiso;
use Illuminate\Http\Request;

class PermisoController extends Controller
{
    // Devuelve todos los permisos registrados
    public function index()
    {
        return Permiso::all();
    }

    // Registra un nuevo permiso en el sistema
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

    // Muestra los detalles de un permiso especifico
    public function show($id)
    {
        return Permiso::findOrFail($id);
    }

    // Actualiza la informacion de un permiso existente
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

    // Elimina un permiso de la base de datos
    public function destroy($id)
    {
        $permiso = Permiso::findOrFail($id);
        $permiso->delete();

        return response()->json(null, 204);
    }
}