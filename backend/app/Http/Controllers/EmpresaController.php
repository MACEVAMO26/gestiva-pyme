<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Tarifa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmpresaController extends Controller
{
    // --- GESTIÓN DE EMPRESAS ---
    // Obtiene la lista de todas las empresas registradas
    public function index()
    {
        return response()->json(Empresa::all());
    }

    public function suscripcionesStats()
    {
        $empresas = Empresa::all();
        
        $mrr = $empresas->where('activo', 1)->sum('monto_mensual');
        $clientesActivos = $empresas->where('activo', 1)->count();
        $clientesMora = $empresas->where('activo', 1)->where('estado_pago', 'mora')->count();
        
        // Define el porcentaje de crecimiento (dato estático temporalmente)
        $crecimientoMensual = 12.5;

        $lista = $empresas->map(function ($emp) {
            // Lógica de módulos adicionales
            $tipo = $emp->tipo_empresa; // 'Ventas', 'Servicios', 'Ventas y Servicios'
            $paquetesBase = [];
            if ($tipo === 'Ventas' || $tipo === 'Ventas y Servicios') $paquetesBase[] = 'ventas';
            if ($tipo === 'Servicios' || $tipo === 'Ventas y Servicios') $paquetesBase[] = 'servicios';

            $modulosActivos = $emp->modulos()->wherePivot('activo', 1)->get();
            
            $transversales = [];
            $addons = [];
            foreach ($modulosActivos as $mod) {
                if (!in_array($mod->paquete, $paquetesBase)) {
                    if ($mod->paquete === 'addons') {
                        $addons[] = ['nombre' => $mod->nombre, 'valor' => 10000];
                    } else {
                        $transversales[] = $mod->nombre;
                    }
                }
            }
            
            // Add custom addons from JSON column
            $addonsPersonalizados = is_array($emp->addons_personalizados) ? $emp->addons_personalizados : [];
            $addons = array_merge($addons, $addonsPersonalizados);

            // Handle descuentos
            $descuentos = is_array($emp->descuentos_aplicados) ? $emp->descuentos_aplicados : [];
            if (empty($descuentos) && $emp->descuento && $emp->descuento !== 'N/A') {
                $descuentos[] = ['descripcion' => $emp->descuento, 'porcentaje' => 10];
            }

            // Handle cargos extra
            $cargosExtra = is_array($emp->cargos_extra) ? $emp->cargos_extra : [];

            return [
                'id' => $emp->id,
                'empresaId' => $emp->id,
                'nombreEmpresa' => $emp->razon_social,
                'fechaInscripcion' => $emp->fecha_inscripcion ? date('d/M/Y', strtotime($emp->fecha_inscripcion)) : date('d/M/Y'),
                'plan' => $emp->plan_suscripcion ?: 'Mensual',
                'modulosExtra' => count($transversales),
                'addonsList' => $addons,
                'descuentosAplicados' => $descuentos,
                'cargosExtra' => $cargosExtra,
                'proximoPagoTotal' => $emp->monto_mensual ?: 0,
                'fechaProximoPago' => $emp->fecha_proximo_pago ?: date('Y-m-d', strtotime('+30 days')),
                'estado' => $emp->estado_pago === 'mora' ? 'En Mora' : ($emp->estado_pago === 'suspendido' ? 'Inactiva' : 'Activa'),
                'renovaciones' => $emp->renovaciones ?: 0
            ];
        });

        return response()->json([
            'stats' => [
                'mrr' => $mrr,
                'clientesActivos' => $clientesActivos,
                'clientesMora' => $clientesMora,
                'crecimientoMensual' => $crecimientoMensual
            ],
            'lista' => $lista
        ]);
    }

    public function updateTarifas(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);
        
        $empresa->update([
            'descuentos_aplicados' => $request->descuentosAplicados,
            'cargos_extra' => $request->cargosExtra,
            'addons_personalizados' => $request->addonsList,
        ]);
        
        return response()->json(['message' => 'Tarifas actualizadas correctamente']);
    }

    public function systemStats()
    {
        // Calcula el tiempo transcurrido desde la última actividad registrada por cualquier usuario
        $lastActivityUser = \Illuminate\Support\Facades\DB::table('usuarios')
            ->whereNotNull('last_activity_at')
            ->orderBy('last_activity_at', 'desc')
            ->first();

        $lastActivityDiff = 'Desconocida';
        if ($lastActivityUser) {
            $lastActivityDiff = \Carbon\Carbon::parse($lastActivityUser->last_activity_at)->diffForHumans();
        }

        return response()->json([
            'generalUptime' => '99.9%',
            'dbConnection' => 'Estable',
            'lastBackup' => 'Hace 2 horas',
            'lastActivity' => $lastActivityDiff
        ]);
    }

    // Crea una nueva empresa y genera automáticamente su usuario gerente administrador
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'razon_social' => 'required|string|max:255',
            'nit' => 'required|string|max:255|unique:empresa',
            'tipo_empresa' => 'required|in:Servicios,Ventas,Ventas y Servicios',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'ciudad' => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|max:255',
            'color_primario' => 'nullable|string|max:7',
            'fecha_inscripcion' => 'nullable|date',
            'descuento' => 'nullable|string|max:255',
            'periodo' => 'nullable|in:Mensual,Anual',
        ]);

        // Utiliza una transacción para garantizar la creación conjunta de empresa y gerente
        DB::beginTransaction();
        try {

            if (empty($validatedData['fecha_inscripcion'])) {
                $validatedData['fecha_inscripcion'] = date('Y-m-d');
            }
            $empresa = Empresa::create($validatedData);

            // Construye un correo por defecto para el administrador usando el ID de la empresa
            $adminEmail = 'sadmin-id' . $empresa->id . '@gestivapyme.com';

            // Crea el rol "Gerente" para la empresa
            $rolGerente = \App\Models\Role::create([
                'empresa_id' => $empresa->id,
                'nombre' => 'Gerente',
                'descripcion' => 'Administrador principal de la empresa',
                'activo' => 1
            ]);

            // Asigna todos los permisos al rol Gerente
            $modulos = \Illuminate\Support\Facades\DB::table('modulos')->pluck('id');
            foreach ($modulos as $modId) {
                \App\Models\Permiso::create([
                    'rol_id' => $rolGerente->id,
                    'modulo' => $modId,
                    'puede_ver' => 1,
                    'puede_crear' => 1,
                    'puede_editar' => 1,
                    'puede_inactivar' => 1
                ]);
            }

            // Registra el usuario gerente con rol de administrador y lo asocia a la empresa
            User::create([
                'empresa_id' => $empresa->id,
                'rol_id' => $rolGerente->id,
                'nombres' => 'Gerente',
                'apellidos' => $empresa->razon_social,
                'documento' => $empresa->nit,
                'email' => $adminEmail,
                'password_hash' => Hash::make('Admin_123'),
                'activo' => 1
            ]);

            DB::commit();
            return response()->json([
                'message' => 'Empresa y gerente creados exitosamente.',
                'empresa' => $empresa,
                'admin_email' => $adminEmail
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al crear la empresa.'], 500);
        }
    }

    // Retorna los detalles de una empresa específica
    public function show($id)
    {
        return response()->json(Empresa::findOrFail($id));
    }

    // Actualiza la información de una empresa existente validando campos requeridos
    public function update(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        $validatedData = $request->validate([
            'razon_social' => 'required|string|max:255',
            'nit' => ['required', 'string', 'max:255', Rule::unique('empresa')->ignore($empresa->id)],
            'tipo_empresa' => 'required|in:Servicios,Ventas,Ventas y Servicios',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'ciudad' => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|max:255',
            'color_primario' => 'nullable|string|max:7',
            'fecha_inscripcion' => 'nullable|date',
            'descuento' => 'nullable|string|max:255',
            'periodo' => 'nullable|in:Mensual,Anual',
        ]);

        $empresa->update($validatedData);
        return response()->json($empresa);
    }

    // Modifica el estado de la empresa alternando su disponibilidad o marcándola en mora
    public function registrarRenovacion($id)
    {
        $empresa = Empresa::findOrFail($id);
        $empresa->renovaciones += 1;
        
        $proximo = $empresa->fecha_proximo_pago ? CarbonCarbon::parse($empresa->fecha_proximo_pago) : CarbonCarbon::now();
        $empresa->fecha_proximo_pago = $proximo->addDays(30)->format('Y-m-d');
        
        $empresa->save();
        
        return response()->json(['message' => 'Renovación registrada exitosamente', 'empresa' => $empresa]);
    }

    // Modifica el estado de la empresa alternando su disponibilidad o marcándola en mora
    public function changeStatus(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);
        $accion = $request->input('accion');

        if ($accion === 'activar') {
            $empresa->activo = 1;
            $empresa->estado_pago = 'al_dia';
            $empresa->inactive_at = null;
        } elseif ($accion === 'inactivar') {
            $empresa->activo = 0;
            $empresa->inactive_at = now();
        } elseif ($accion === 'mora') {
            $empresa->activo = 1;
            $empresa->estado_pago = 'mora';
        } else {
            $empresa->activo = !$empresa->activo;
            $empresa->inactive_at = $empresa->activo ? null : now();
        }

        $empresa->save();

        $message = $empresa->activo ? 'Empresa activada.' : 'Empresa inactivada.';
        return response()->json(['message' => $message]);
    }
}