<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // Listar
    public function index()
    {
        // Aislar por la empresa del usuario autenticado
        return User::where('empresa_id', auth()->user()->empresa_id)->get();
    }

    // Crear
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'documento' => 'required|string|max:255|unique:usuarios',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'cargo_id' => 'required|integer|exists:cargos,id',
            'rol_id' => 'required|integer|exists:roles,id',
        ]);

        $user = User::create([
            'nombres' => $validatedData['nombres'],
            'apellidos' => $validatedData['apellidos'],
            'documento' => $validatedData['documento'],
            'email' => $validatedData['email'],
            // La contraseña inicial es el documento, y debe cambiarla.
            'password_hash' => Hash::make($validatedData['documento']),
            'debe_cambiar_clave' => true,
            // Forzamos el empresa_id del administrador autenticado
            'empresa_id' => auth()->user()->empresa_id,
            'cargo_id' => $validatedData['cargo_id'],
            'rol_id' => $validatedData['rol_id'],
        ]);

        return response()->json($user, 201);
    }

    // Mostrar
    
    public function show($id)
    {
        return User::findOrFail($id);
    }

    // Actualizar
    
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validatedData = $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'documento' => ['required', 'string', 'max:255', Rule::unique('usuarios')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('usuarios')->ignore($user->id)],
            'cargo_id' => 'required|integer|exists:cargos,id',
            'rol_id' => 'required|integer|exists:roles,id',
        ]);

        $user->update($validatedData);
        
        return response()->json($user);
    }

    // Cambiar estado
    
    public function changeStatus($id)
    {
        $user = User::findOrFail($id);
        
        $user->activo = !$user->activo;
        $user->fecha_inactivacion = $user->activo ? null : now();

        $user->save();

        $message = $user->activo ? 'Usuario activado correctamente.' : 'Usuario inactivado correctamente.';
        return response()->json(['message' => $message]);
    }
}