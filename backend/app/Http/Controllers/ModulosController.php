<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Empresa;
use App\Models\Modulo;
use Illuminate\Support\Facades\DB;

class ModulosController extends Controller
{
    // --- GESTIÓN DE MÓDULOS DE EMPRESA ---
    // Obtiene los módulos asignados a una empresa e inicializa los predeterminados si no tiene
    public function getModulosPorEmpresa($empresaId)
    {
        $empresa = Empresa::find($empresaId);
        if (!$empresa) {
            return response()->json(['error' => 'Empresa no encontrada'], 404);
        }

        if ($empresa->modulos()->count() === 0) {
            $this->inicializarModulosEmpresa($empresa);
        }

        $modulosMaster = Modulo::all();
        
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
            $nuevoEstado = !$moduloPivot->activo;
            DB::table('empresa_modulo')
              ->where('empresa_id', $empresaId)
              ->where('modulo_id', $moduloId)
              ->update(['activo' => $nuevoEstado, 'updated_at' => now()]);
            
            return response()->json(['message' => 'Módulo actualizado', 'activo' => $nuevoEstado]);
        } else {
            // Asigna y activa el módulo simulando la compra de un addon
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

    // --- GESTIÓN GLOBAL DE MÓDULOS ---
    // Registra un nuevo módulo global en el sistema
    public function store(Request $request)
    {
        $request->validate([
            'id' => 'required|string|unique:modulos,id',
            'nombre' => 'required|string',
            'paquete' => 'required|string'
        ]);

        $modulo = Modulo::create([
            'id' => $request->id,
            'nombre' => $request->nombre,
            'paquete' => $request->paquete,
            'activo' => false
        ]);

        return response()->json(['message' => 'Módulo creado', 'modulo' => $modulo]);
    }

    public function update(Request $request, $id)
    {
        $modulo = Modulo::find($id);
        if (!$modulo) {
            return response()->json(['error' => 'Módulo no encontrado'], 404);
        }

        $request->validate([
            'nombre' => 'required|string'
        ]);

        $modulo->nombre = $request->nombre;
        $modulo->save();

        return response()->json(['message' => 'Módulo actualizado', 'modulo' => $modulo]);
    }

    public function destroy($id)
    {
        $modulo = Modulo::find($id);
        if (!$modulo) {
            return response()->json(['error' => 'Módulo no encontrado'], 404);
        }

        // Elimina las asignaciones del módulo en todas las empresas antes de borrarlo
        DB::table('empresa_modulo')->where('modulo_id', $id)->delete();
        $modulo->delete();

        return response()->json(['message' => 'Módulo eliminado correctamente']);
    }
}
