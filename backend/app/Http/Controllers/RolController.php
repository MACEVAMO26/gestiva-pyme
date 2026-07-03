<?php

namespace App\Http\Controllers;

// Se importan las clases necesarias para el controlador.
use App\Models\Role;       // Se importa el modelo Role.
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * ===================================================================================
 *  CONTROLADOR DE ROLES (RoleController)
 * ===================================================================================
 *
 * Este controlador gestiona todas las operaciones CRIU para los roles del sistema,
 * que definen los conjuntos de permisos para los usuarios.
 *
 */
class RoleController extends Controller
{
    // Devuelve una lista de todos los roles.
    // Se ha simplificado para devolver todos, activos e inactivos.
    // El frontend puede decidir cuáles mostrar.
    // Listar
    public function index()
    {
        return Role::all();
    }

    // Crea un nuevo rol en la base de datos.
    // Crear
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombre' => 'required|string|max:255|unique:roles', // El nombre debe ser único.
            'descripcion' => 'nullable|string',
        ]);
        $data = array_merge($validatedData, [
            'empresa_id' => 1, // NOTA TEMPORAL: Asignado a la empresa 1 por ahora.
            'activo' => true,
        ]);
        $role = Role::create($data);
        return response()->json($role, 201);
    }

    // Mostrar
    
    public function show($id)
    {
        return Role::findOrFail($id);
    }

    // Actualizar los datos de un rol existente.
    
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

    // Cambia el estado de un rol entre activo e inactivo.
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