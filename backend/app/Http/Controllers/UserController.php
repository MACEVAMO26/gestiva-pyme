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
        return User::with(['cargo', 'rol', 'empleado'])->where('empresa_id', auth()->user()->empresa_id)->get();
    }

    // Registra la "cáscara" de un nuevo usuario (Hecho por el Gerente)
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombres' => 'required|string|max:255',
            'primer_apellido' => 'required|string|max:255',
            'segundo_apellido' => 'required|string|max:255',
            'documento' => 'required|string|max:255|unique:usuarios',
            'email_personal' => 'required|string|email|max:255',
            'telefono' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
        ]);

        // 1. Limpiar strings para generar el correo
        $cleanString = function($string) {
            $string = strtolower(trim($string));
            $string = str_replace(['á','é','í','ó','ú','ñ',' '], ['a','e','i','o','u','n',''], $string);
            return preg_replace('/[^a-z0-9]/', '', $string);
        };

        $n = $cleanString($validatedData['nombres']);
        $p = $cleanString($validatedData['primer_apellido']);
        $s = $cleanString($validatedData['segundo_apellido']);

        $prefixBase = substr($n, 0, 4) . substr($p, 0, 3) . substr($s, 0, 2);
        
        $empresa = \App\Models\Empresa::find(auth()->user()->empresa_id);
        $domain = '@' . \Str::slug($empresa->nombre, '') . '.gestivapyme.com';
        
        $finalEmail = $prefixBase . $domain;
        
        // Estrategias alternativas de corte si el correo ya existe (sin usar números)
        $strategies = [
            fn() => substr($n, 0, 5) . substr($p, 0, 2) . substr($s, 0, 2), // 5-2-2
            fn() => substr($n, 0, 3) . substr($p, 0, 4) . substr($s, 0, 2), // 3-4-2
            fn() => substr($n, 0, 4) . substr($p, 0, 2) . substr($s, 0, 3), // 4-2-3
            fn() => $n . substr($p, 0, 3) . substr($s, 0, 2),               // Nombre completo + 3 + 2
            fn() => substr($n, 0, 4) . $p . substr($s, 0, 2),               // 4 + Apellido1 completo + 2
            fn() => $n . $p . substr($s, 0, 2),                             // Nombre completo + Apellido1 + 2
            fn() => substr($n, 0, 4) . substr($p, 0, 3) . $validatedData['documento'] // Si todo falla, usar el documento
        ];

        $strategyIndex = 0;
        
        // Garantizar que no se repita usando combinaciones alternativas
        while (User::where('email', $finalEmail)->exists()) {
            if (isset($strategies[$strategyIndex])) {
                $newPrefix = $strategies[$strategyIndex]();
                $finalEmail = $newPrefix . $domain;
                $strategyIndex++;
            } else {
                // Como ultimísimo recurso en caso extremo de tocayos idénticos y múltiples fallos
                $finalEmail = $prefixBase . rand(10, 99) . $domain; 
            }
        }

        // 2. La contraseña es el documento de identidad
        $tempPassword = $validatedData['documento'];
        $apellidosCompletos = trim($validatedData['primer_apellido'] . ' ' . $validatedData['segundo_apellido']);

        $user = \Illuminate\Support\Facades\DB::transaction(function () use ($validatedData, $apellidosCompletos, $finalEmail, $tempPassword) {
            $user = User::create([
                'nombres' => $validatedData['nombres'],
                'apellidos' => $apellidosCompletos,
                'documento' => $validatedData['documento'],
                'email' => $finalEmail,
                'email_personal' => $validatedData['email_personal'],
                'telefono' => $validatedData['telefono'] ?? null,
                'direccion' => $validatedData['direccion'] ?? null,
                'password_hash' => Hash::make($tempPassword),
                'debe_cambiar_clave' => true,
                'perfil_formalizado' => false,
                'empresa_id' => auth()->user()->empresa_id,
            ]);

            // LEY: El primer usuario creado por el gerente asume el rol de RRHH
            $companyUsersCount = User::where('empresa_id', auth()->user()->empresa_id)->count();
            
            // Si hay exactamente 2 usuarios (El gerente y este nuevo que se acaba de crear)
            if ($companyUsersCount === 2) {
                $roleJefe = \App\Models\Role::firstOrCreate(
                    ['empresa_id' => auth()->user()->empresa_id, 'nombre' => 'Jefe de Área']
                );
                
                $cargoRRHH = \App\Models\Cargo::firstOrCreate(
                    ['empresa_id' => auth()->user()->empresa_id, 'nombre' => 'Jefe de Recursos Humanos'],
                    ['descripcion' => 'Responsable de la gestión humana de la empresa']
                );

                $areaRRHH = \App\Models\Area::firstOrCreate(
                    ['empresa_id' => auth()->user()->empresa_id, 'nombre' => 'Recursos Humanos'],
                    ['descripcion' => 'Área encargada de nómina, contratación y bienestar']
                );

                // Asignar los permisos inmediatamente a este primer usuario
                $user->rol_id = $roleJefe->id;
                $user->cargo_id = $cargoRRHH->id;
                $user->perfil_formalizado = true; // No requiere formalización adicional
                $user->save();

                // Formalizar su registro como Empleado
                \App\Models\Empleado::create([
                    'usuario_id' => $user->id,
                    'empresa_id' => $user->empresa_id,
                    'area_id' => $areaRRHH->id,
                    'cargo_id' => $cargoRRHH->id,
                    'codigo_empleado' => 'EMP-' . $user->empresa_id . '-001',
                    'fecha_contratacion' => now()
                ]);
            }
            
            return $user;
        });

        // Enviar el correo con las credenciales usando Brevo (SMTP)
        try {
            $empresa = \App\Models\Empresa::find(auth()->user()->empresa_id);
            \Mail::to($user->email_personal)->send(new \App\Mail\CredencialesUsuarioMail($user, $tempPassword, $empresa->nombre));
        } catch (\Exception $e) {
            \Log::error("Error enviando correo a {$user->email_personal}: " . $e->getMessage());
            // No detenemos la creación del usuario si falla el envío de correo.
        }

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