<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // Trae los usuarios de la misma empresa
    public function index()
    {
        return User::where('empresa_id', auth()->user()->empresa_id)->get();
    }

    // Registra un nuevo empleado o usuario
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
            // Usa el documento como clave temporal
            'password_hash' => Hash::make($validatedData['documento']),
            'debe_cambiar_clave' => true,
            // Asigna la misma empresa del admin al nuevo usuario
            'empresa_id' => auth()->user()->empresa_id,
            'cargo_id' => $validatedData['cargo_id'],
            'rol_id' => $validatedData['rol_id'],
        ]);

        return response()->json($user, 201);
    }

    // Trae la informacion de un usuario especifico
    public function show($id)
    {
        return User::findOrFail($id);
    }

    // Actualiza la informacion de un usuario
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

    // Activa o inactiva un usuario en el sistema
    public function changeStatus($id)
    {
        $user = User::findOrFail($id);
        
        $user->activo = !$user->activo;
        $user->fecha_inactivacion = $user->activo ? null : now();

        $user->save();

        $message = $user->activo ? 'Usuario activado correctamente.' : 'Usuario inactivado correctamente.';
        return response()->json(['message' => $message]);
    }

    // Sube o actualiza la foto de perfil del usuario
    public function uploadAvatar(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        if ($request->hasFile('avatar')) {
            try {
                $uploaded = cloudinary()->uploadApi()->upload($request->file('avatar')->getRealPath(), [
                    'folder' => 'avatars'
                ]);
                $user->avatar_url = $uploaded['secure_url'];
            } catch (\Exception $e) {
                \Log::error('Error subiendo a Cloudinary: ' . $e->getMessage());
                return response()->json(['error' => 'Error al guardar la imagen en la nube.'], 500);
            }
        } elseif ($request->has('avatar_url')) {
            $user->avatar_url = $request->input('avatar_url');
        }

        $user->save();
        return response()->json(['avatar_url' => $user->avatar_url], 200);
    }
}