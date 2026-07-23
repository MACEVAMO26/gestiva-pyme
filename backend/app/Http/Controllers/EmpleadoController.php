<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Empleado;

class EmpleadoController extends Controller
{
    // Trae la lista de usuarios "cáscara" pendientes de formalización
    public function pendientes()
    {
        $empresaId = auth()->user()->empresa_id;
        $pendientes = User::where('empresa_id', $empresaId)
                          ->where('perfil_formalizado', false)
                          ->get();
                          
        return response()->json($pendientes);
    }

    // Trae la lista de empleados ya formalizados
    public function index()
    {
        $empresaId = auth()->user()->empresa_id;
        // Cargamos la relación con usuario para traer nombre, documento, etc.
        $empleados = Empleado::with(['usuario', 'area', 'cargo'])
                             ->where('empresa_id', $empresaId)
                             ->get();
                             
        return response()->json($empleados);
    }

    // Formaliza un usuario "cáscara", creando su perfil de empleado y otorgando acceso
    public function formalizar(Request $request, $usuarioId)
    {
        $request->validate([
            'area_id' => 'required|integer|exists:areas,id',
            'cargo_id' => 'required|integer|exists:cargos,id',
            'tipo_contrato' => 'required|string',
            'fecha_contratacion' => 'required|date',
            'salario' => 'nullable|numeric',
            'eps' => 'nullable|string',
            'arl' => 'nullable|string',
            'fondo_pension' => 'nullable|string',
            'fondo_cesantias' => 'nullable|string',
            'caja_compensacion' => 'nullable|string'
        ]);

        $empresaId = auth()->user()->empresa_id;
        
        $usuario = User::where('id', $usuarioId)->where('empresa_id', $empresaId)->firstOrFail();

        if ($usuario->perfil_formalizado) {
            return response()->json(['error' => 'El usuario ya está formalizado'], 400);
        }

        // 1. Crear el registro en empleados
        $empleado = Empleado::create([
            'usuario_id' => $usuario->id,
            'empresa_id' => $empresaId,
            'area_id' => $request->area_id,
            'cargo_id' => $request->cargo_id,
            'tipo_contrato' => $request->tipo_contrato,
            'fecha_contratacion' => $request->fecha_contratacion,
            'salario' => $request->salario,
            'eps' => $request->eps,
            'arl' => $request->arl,
            'fondo_pension' => $request->fondo_pension,
            'fondo_cesantias' => $request->fondo_cesantias,
            'caja_compensacion' => $request->caja_compensacion,
            'estado' => 'activo'
        ]);

        // 2. Actualizar el usuario para desbloquearlo
        $usuario->perfil_formalizado = true;
        $usuario->save();

        return response()->json([
            'message' => 'Empleado formalizado exitosamente. Acceso concedido al sistema.',
            'empleado' => $empleado
        ]);
    }
}
