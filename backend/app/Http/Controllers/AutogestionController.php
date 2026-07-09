<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AutogestionController extends Controller
{
    // --- GESTIÓN DE AFILIACIONES PROPIAS ---
    // Obtiene los datos de afiliación del usuario autenticado
    public function misAfiliaciones(Request $request)
    {
        $user = $request->user();
        $afiliacion = DB::table('afiliaciones')->where('user_id', $user->id)->first();
        
        return response()->json([
            'afiliacion' => $afiliacion
        ]);
    }

    // Guarda o actualiza las afiliaciones del empleado asignándoles estado pendiente
    public function guardarAfiliaciones(Request $request)
    {
        $request->validate([
            'eps' => 'nullable|string|max:255',
            'arl' => 'nullable|string|max:255',
            'afondo_pension' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $existe = DB::table('afiliaciones')->where('user_id', $user->id)->first();

        // Limita la actualización a datos básicos, excluyendo fechas reservadas para RRHH
        if ($existe) {
            DB::table('afiliaciones')->where('user_id', $user->id)->update([
                'eps' => $request->eps,
                'arl' => $request->arl,
                'afondo_pension' => $request->afondo_pension,
                'estado' => 'pendiente',
                'updated_at' => now(),
            ]);
        } else {
            DB::table('afiliaciones')->insert([
                'user_id' => $user->id,
                'eps' => $request->eps,
                'arl' => $request->arl,
                'afondo_pension' => $request->afondo_pension,
                'estado' => 'pendiente',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Tus datos de afiliación han sido guardados y enviados para aprobación.'
        ]);
    }

    // --- GESTIÓN DE AFILIACIONES POR RRHH ---
    // Obtiene la información de afiliación de un empleado específico
    public function obtenerAfiliacionEmpleado(Request $request, $id)
    {

        $afiliacion = DB::table('afiliaciones')->where('user_id', $id)->first();
        return response()->json(['afiliacion' => $afiliacion]);
    }

    // Aprueba, rechaza y asigna fechas contractuales a las afiliaciones de un empleado
    public function gestionarAfiliacionEmpleado(Request $request, $id)
    {
        $request->validate([
            'eps' => 'nullable|string|max:255',
            'arl' => 'nullable|string|max:255',
            'afondo_pension' => 'nullable|string|max:255',
            'estado' => 'required|in:aprobado,rechazado,pendiente',
            'notas_rechazo' => 'nullable|string',
            'fecha_contratacion' => 'nullable|date',
            'finalizacion_contrato' => 'nullable|date',
            'renovacion_contrato' => 'nullable|date',
        ]);

        $existe = DB::table('afiliaciones')->where('user_id', $id)->first();

        if ($existe) {
            DB::table('afiliaciones')->where('user_id', $id)->update([
                'eps' => $request->eps,
                'arl' => $request->arl,
                'afondo_pension' => $request->afondo_pension,
                'estado' => $request->estado,
                'notas_rechazo' => $request->notas_rechazo,
                'fecha_contratacion' => $request->fecha_contratacion,
                'finalizacion_contrato' => $request->finalizacion_contrato,
                'renovacion_contrato' => $request->renovacion_contrato,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('afiliaciones')->insert([
                'user_id' => $id,
                'eps' => $request->eps,
                'arl' => $request->arl,
                'afondo_pension' => $request->afondo_pension,
                'estado' => $request->estado,
                'notas_rechazo' => $request->notas_rechazo,
                'fecha_contratacion' => $request->fecha_contratacion,
                'finalizacion_contrato' => $request->finalizacion_contrato,
                'renovacion_contrato' => $request->renovacion_contrato,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Afiliación y fechas gestionadas con éxito.'
        ]);
    }
}
