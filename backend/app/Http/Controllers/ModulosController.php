<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Empresa;
use App\Models\Modulo;
use Illuminate\Support\Facades\DB;

class ModulosController extends Controller
{
    // Obtener los módulos de una empresa (inicializa si es la primera vez)
    public function getModulosPorEmpresa($empresaId)
    {
        $empresa = Empresa::find($empresaId);
        if (!$empresa) {
            return response()->json(['error' => 'Empresa no encontrada'], 404);
        }

        // Si la empresa no tiene módulos en la tabla pivote, inicializarlos
        if ($empresa->modulos()->count() === 0) {
            $this->inicializarModulosEmpresa($empresa);
        }

        // Obtener todos los módulos maestros
        $modulosMaster = Modulo::all();
        
        // Obtener los módulos asignados a la empresa con su estado
        $modulosEmpresa = DB::table('empresa_modulo')
                            ->where('empresa_id', $empresa->id)
                            ->get()
                            ->keyBy('modulo_id');

        $resultado = [];

        foreach ($modulosMaster as $modulo) {
            $paquete = $modulo->paquete;
            if (!isset($resultado[$paquete])) {
                $resultado[$paquete] = [];
            }
            
            // Ver si la empresa tiene este módulo asignado
            $asignado = $modulosEmpresa->has($modulo->id);
            $activoParaEmpresa = $asignado ? (bool) $modulosEmpresa[$modulo->id]->activo : false;

            $resultado[$paquete][] = [
                'id' => $modulo->id,
                'nombre' => $modulo->nombre,
                'activo' => $activoParaEmpresa,
                'asignado' => $asignado
            ];
        }

        return response()->json(['modulos' => $resultado]);
    }

    private function inicializarModulosEmpresa(Empresa $empresa)
    {
        $modulosAsignar = [];
        $tipo = $empresa->tipo_empresa; // 'Ventas', 'Servicios', 'Ventas y Servicios'

        $modulosTransversales = Modulo::whereIn('paquete', ['finanzas', 'rrhh'])->pluck('id')->toArray();
        $modulosVentas = Modulo::where('paquete', 'ventas')->pluck('id')->toArray();
        $modulosServicios = Modulo::where('paquete', 'servicios')->pluck('id')->toArray();

        $modulosAsignar = array_merge($modulosAsignar, $modulosTransversales);

        if ($tipo === 'Ventas' || $tipo === 'Ventas y Servicios') {
            $modulosAsignar = array_merge($modulosAsignar, $modulosVentas);
        }
        
        if ($tipo === 'Servicios' || $tipo === 'Ventas y Servicios') {
            $modulosAsignar = array_merge($modulosAsignar, $modulosServicios);
        }

        // Add-ons no se asignan automáticamente

        $syncData = [];
        foreach ($modulosAsignar as $moduloId) {
            $syncData[$moduloId] = ['activo' => true];
        }

        $empresa->modulos()->sync($syncData);
    }

    public function toggleModuloEmpresa(Request $request, $empresaId, $moduloId)
    {
        $empresa = Empresa::find($empresaId);
        if (!$empresa) {
            return response()->json(['error' => 'Empresa no encontrada'], 404);
        }

        $moduloPivot = DB::table('empresa_modulo')
                         ->where('empresa_id', $empresaId)
                         ->where('modulo_id', $moduloId)
                         ->first();

        if ($moduloPivot) {
            // Alternar estado
            $nuevoEstado = !$moduloPivot->activo;
            DB::table('empresa_modulo')
              ->where('empresa_id', $empresaId)
              ->where('modulo_id', $moduloId)
              ->update(['activo' => $nuevoEstado, 'updated_at' => now()]);
            
            return response()->json(['message' => 'Módulo actualizado', 'activo' => $nuevoEstado]);
        } else {
            // Si no estaba asignado, lo asignamos y lo activamos (como si comprara el addon)
            DB::table('empresa_modulo')->insert([
                'empresa_id' => $empresaId,
                'modulo_id' => $moduloId,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            return response()->json(['message' => 'Módulo asignado y activado', 'activo' => true]);
        }
    }

    public function updatePaqueteEmpresa(Request $request, $empresaId)
    {
        $empresa = Empresa::find($empresaId);
        if (!$empresa) {
            return response()->json(['error' => 'Empresa no encontrada'], 404);
        }

        $modulosState = $request->input('modulos', []);

        foreach ($modulosState as $mod) {
            $moduloId = $mod['id'];
            $activo = $mod['activo'];

            $moduloPivot = DB::table('empresa_modulo')
                             ->where('empresa_id', $empresaId)
                             ->where('modulo_id', $moduloId)
                             ->first();

            if ($moduloPivot) {
                DB::table('empresa_modulo')
                  ->where('empresa_id', $empresaId)
                  ->where('modulo_id', $moduloId)
                  ->update(['activo' => $activo, 'updated_at' => now()]);
            } else {
                DB::table('empresa_modulo')->insert([
                    'empresa_id' => $empresaId,
                    'modulo_id' => $moduloId,
                    'activo' => $activo,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        return response()->json(['message' => 'Paquete actualizado correctamente']);
    }
}
