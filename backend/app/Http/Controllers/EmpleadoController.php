<?php

namespace App\Http\Controllers;

use App\Models\Empleado;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmpleadoController extends Controller
{
    // Para traer la lista de empleados filtrada por la empresa actual
    public function index($empresa_id) 
    {
        $empleados = Empleado::with(['area', 'jerarquia', 'user'])
            ->where('empresa_id', $empresa_id)
            ->get();
            
        return response()->json($empleados);
    }

    // Para registrar un nuevo empleado y crearle un usuario automáticamente
    public function store(Request $request) 
    {
        // Reglas de validación
        $request->validate([
            'nombres' => 'required|string',
            'apellidos' => 'required|string',
            'documento' => 'required|string|unique:empleados',
            'empresa_id' => 'required|exists:empresa,id',
            'area_id' => 'required|exists:areas,id',
            'jerarquia_id' => 'required|exists:jerarquias,id',
            'cargo' => 'required|string',
            'email' => 'required|email|unique:users',
        ]);

        DB::beginTransaction();
        try {
            // 1. Crear el usuario (Autogeneración)
            $password = Hash::make($request->documento); // Contraseña por defecto: el documento
            $user = User::create([
                'nombres' => $request->nombres,
                'apellidos' => $request->apellidos,
                'email' => $request->email,
                'password' => $password,
                'empresa_id' => $request->empresa_id,
                // Puedes asignar un rol por defecto aquí si lo manejas en User
            ]);

            // 2. Generar el código de empleado (EM-000X)
            $count = Empleado::where('empresa_id', $request->empresa_id)->count() + 1;
            $codigo = 'EM-' . str_pad($count, 4, '0', STR_PAD_LEFT);

            // 3. Crear el empleado vinculado al usuario
            $empleado = Empleado::create([
                'codigo_empleado' => $codigo,
                'user_id' => $user->id,
                'empresa_id' => $request->empresa_id,
                'area_id' => $request->area_id,
                'jerarquia_id' => $request->jerarquia_id,
                'nombres' => $request->nombres,
                'apellidos' => $request->apellidos,
                'documento' => $request->documento,
                'cargo' => $request->cargo,
                'estado' => 'activo',
                'eps' => $request->eps,
                'arl' => $request->arl,
                'fondo_pension' => $request->fondo_pension,
                'fondo_cesantias' => $request->fondo_cesantias,
            ]);

            DB::commit();
            return response()->json([
                'message' => 'Empleado y Usuario creados con éxito',
                'empleado' => $empleado
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear empleado', 'error' => $e->getMessage()], 500);
        }
    }
}
