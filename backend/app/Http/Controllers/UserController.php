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
        return User::with(['cargo', 'rol'])->where('empresa_id', auth()->user()->empresa_id)->get();
    }

    // Registra la "cáscara" de un nuevo usuario (Hecho por el Gerente)
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'required|string|max:255',
            'documento' => 'required|string|max:255|unique:usuarios',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'telefono' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
        ]);

        // Generar una contraseña temporal aleatoria de 8 caracteres
        $tempPassword = \Str::random(8);

        $user = User::create([
            'nombres' => $validatedData['nombres'],
            'apellidos' => $validatedData['apellidos'],
            'documento' => $validatedData['documento'],
            'email' => $validatedData['email'],
            'telefono' => $validatedData['telefono'] ?? null,
            'direccion' => $validatedData['direccion'] ?? null,
            'password_hash' => Hash::make($tempPassword),
            'debe_cambiar_clave' => true,
            'perfil_formalizado' => false, // Obliga a esperar a RRHH
            'empresa_id' => auth()->user()->empresa_id,
        ]);

        // TODO: Enviar correo al usuario con su $tempPassword (pendiente de integración de correos)

        return response()->json([
            'user' => $user,
            'temp_password' => $tempPassword, // Se devuelve para mostrar en pantalla al gerente mientras se configuran correos
            'message' => 'Usuario creado exitosamente. Perfil pendiente de formalización por Gestión Humana.'
        ], 201);
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