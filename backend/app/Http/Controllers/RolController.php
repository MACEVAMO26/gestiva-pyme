<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    // Trae la lista completa de roles
    public function index()
    {
        return Role::all();
    }

    // Crea un nuevo rol
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombre' => 'required|string|max:255|unique:roles',
            'descripcion' => 'nullable|string',
        ]);
        $data = array_merge($validatedData, [
            'empresa_id' => 1,
            'activo' => true,
        ]);
        $role = Role::create($data);
        return response()->json($role, 201);
    }

    // Muestra los datos de un rol especifico
    
    public function show($id)
    {
        return Role::findOrFail($id);
    }

    // Actualiza un rol existente
    
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $validatedData = $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('roles')->ignore($role->id)],
            'descripcion' => 'nullable|string',
        ]);
        $role->update($validatedData);
        return response()->json($role);
    }

    // Activa o inactiva un rol
    public function changeStatus($id)
    {
        $role = Role::findOrFail($id);
        $role->activo = !$role->activo;
        $role->fecha_inactivacion = $role->activo ? null : now();
        $role->save();
        $message = $role->activo ? 'Rol activado correctamente.' : 'Rol inactivado correctamente.';
        return response()->json(['mensaje' => $message]);
    }
}