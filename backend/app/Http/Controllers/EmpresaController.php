<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Tarifa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class EmpresaController extends Controller
{
    // --- GESTIÓN DE EMPRESAS ---
    // Obtiene la lista de todas las empresas registradas
    public function index()
    {
        return response()->json(Empresa::all());
    }

    // Obtiene las estadísticas de suscripciones y la lista detallada de empresas (MRR, clientes, morosos)
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

    // Actualiza las tarifas personalizadas de una empresa (descuentos, cargos extra y addons)
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

    // Calcula y retorna las estadísticas generales del sistema (uptime, última actividad)
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
            'dominio' => 'required|string|unique:empresa,dominio|max:255',
            'nit' => 'required|string|max:255|unique:empresa',
            'tipo_empresa' => 'required|in:Servicios,Ventas,Ventas y Servicios',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'ciudad' => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|max:255',
            'color_primario' => 'nullable|string|max:7',
            'color_secundario' => 'nullable|string|max:7',
            'color_fondo' => 'nullable|string|max:7',
            'color_texto' => 'nullable|string|max:7',
            'fecha_inscripcion' => 'nullable|date',
            'descuento' => 'nullable|string|max:255',
            'periodo' => 'nullable|in:Mensual,Anual',
            'primer_nombre_gerente' => 'nullable|string|max:255',
            'segundo_nombre_gerente' => 'nullable|string|max:255',
            'primer_apellido_gerente' => 'nullable|string|max:255',
            'segundo_apellido_gerente' => 'nullable|string|max:255',
            'tipo_documento_gerente' => 'nullable|string|max:50',
        ]);

        // Utiliza una transacción para garantizar la creación conjunta de empresa y gerente
        DB::beginTransaction();
        try {

            if (empty($validatedData['fecha_inscripcion'])) {
                $validatedData['fecha_inscripcion'] = date('Y-m-d');
            }
            $empresa = Empresa::create($validatedData);

            // Construye el correo máscara institucional usando el dominio
            $adminEmail = 'gerencia@' . $empresa->dominio . '.gestivapyme.com';

            // Crea el rol "Gerente" para la empresa
            $rolGerente = \App\Models\Role::create([
                'empresa_id' => $empresa->id,
                'nombre' => 'Gerente General',
                'descripcion' => 'Administrador principal de la empresa',
                'activo' => 1
            ]);

            // Asigna todos los permisos al rol Gerente
            $modulos = \Illuminate\Support\Facades\DB::table('modulos')->pluck('id');
            foreach ($modulos as $modId) {
                \App\Models\Permiso::create([
                    'rol_id' => $rolGerente->id,
                    'area' => $modId,
                    'puede_ver' => 1,
                    'puede_crear' => 1,
                    'puede_editar' => 1,
                    'puede_inactivar' => 1
                ]);
            }

            // Crea el Área por defecto "Gerencia"
            $areaGerencia = \App\Models\Area::create([
                'empresa_id' => $empresa->id,
                'nombre' => 'Gerencia',
                'descripcion' => 'Área administrativa y de dirección general',
                'activo' => 1
            ]);

            // Crea el Cargo por defecto "Gerente General"
            $cargoGerente = \App\Models\Cargo::create([
                'empresa_id' => $empresa->id,
                'rol_id' => $rolGerente->id,
                'nombre' => 'Gerente General',
                'descripcion' => 'Responsable legal y administrador principal',
                'activo' => 1
            ]);

            // Registra el usuario gerente con rol de administrador y lo asocia a la empresa
            $gerenteUser = User::create([
                'empresa_id' => $empresa->id,
                'rol_id' => $rolGerente->id,
                'cargo_id' => $cargoGerente->id,
                'primer_nombre' => $request->input('primer_nombre_gerente') ?: 'Gerente',
                'segundo_nombre' => $request->input('segundo_nombre_gerente'),
                'primer_apellido' => $request->input('primer_apellido_gerente') ?: $empresa->razon_social,
                'segundo_apellido' => $request->input('segundo_apellido_gerente'),
                'tipo_documento' => $request->input('tipo_documento_gerente') ?: 'CC',
                'documento' => $empresa->nit,
                'email' => $adminEmail,
                'password_hash' => Hash::make('Admin_123'),
                'activo' => 1,
                'perfil_formalizado' => true
            ]);

            // Formaliza al gerente como empleado
            \App\Models\Empleado::create([
                'usuario_id' => $gerenteUser->id,
                'empresa_id' => $empresa->id,
                'area_id' => $areaGerencia->id,
                'cargo_id' => $cargoGerente->id,
                'tipo_contrato' => 'Indefinido',
                'fecha_contratacion' => date('Y-m-d'),
                'estado' => 'activo'
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
            'dominio' => ['required', 'string', 'max:255', Rule::unique('empresa')->ignore($empresa->id)],
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

    // Actualiza la configuración global de Seguridad Social (ARL, Caja) desde RRHH
    public function updateRRHHSettings(Request $request)
    {
        $empresaId = auth()->user()->empresa_id;
        $empresa = Empresa::findOrFail($empresaId);

        $validatedData = $request->validate([
            'arl' => 'nullable|string|max:255',
            'caja_compensacion' => 'nullable|string|max:255',
        ]);

        $empresa->update($validatedData);
        return response()->json([
            'message' => 'Configuración de RRHH actualizada correctamente.',
            'empresa' => $empresa
        ]);
    }

    // Registra la renovación de la suscripción mensual sumando 30 días a la fecha de pago
    public function registrarRenovacion($id)
    {
        $empresa = Empresa::findOrFail($id);
        $empresa->renovaciones += 1;
        
        $proximo = $empresa->fecha_proximo_pago ? \Carbon\Carbon::parse($empresa->fecha_proximo_pago) : \Carbon\Carbon::now();
        $empresa->fecha_proximo_pago = $proximo->addDays(30)->format('Y-m-d');
        
        $empresa->save();
        
        return response()->json(['message' => 'Renovación registrada exitosamente', 'empresa' => $empresa]);
    }

    // Marca la suscripción como no renovada, dejando la empresa inactiva
    public function noRenovar($id)
    {
        $empresa = Empresa::findOrFail($id);
        $empresa->activo = 0;
        $empresa->estado_pago = 'no_renovado';
        $empresa->inactive_at = now();
        $empresa->save();

        return response()->json(['message' => 'Suscripción marcada como no renovada. Empresa inactiva.', 'empresa' => $empresa]);
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

    // --- MÓDULO CONTRATOS SAAS ---
    
    // Acepta el contrato, guarda la firma y registra la IP/Fecha
    public function aceptarContrato(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);
        
        $request->validate([
            'firma_base64' => 'required|string'
        ]);

        $empresa->contrato_aceptado = true;
        $empresa->contrato_fecha_aceptacion = now();
        $empresa->contrato_ip_aceptacion = $request->ip();
        $empresa->contrato_firma_path = $request->firma_base64;
        $empresa->save();

        return response()->json(['message' => 'Contrato aceptado exitosamente.']);
    }

    // Genera y descarga el PDF del contrato de la empresa
    public function descargarContratoPDF($id)
    {
        $empresa = Empresa::findOrFail($id);
        
        if (!$empresa->contrato_aceptado) {
            return response()->json(['error' => 'El contrato aún no ha sido firmado.'], 403);
        }

        // Obtener al gerente de la empresa
        $gerente = User::where('empresa_id', $empresa->id)
            ->whereHas('rol', function($q) {
                $q->where('nombre', 'like', '%Gerente%');
            })->first();
            
        $nombreGerente = $gerente ? ($gerente->nombres . ' ' . $gerente->apellidos) : 'Representante Legal';
        $documentoGerente = $gerente ? $gerente->documento : 'N/A';

        // Estructura de datos para la vista del PDF
        $data = [
            'empresa' => $empresa,
            'nombreGerente' => $nombreGerente,
            'documentoGerente' => $documentoGerente,
            'fecha' => $empresa->contrato_fecha_aceptacion ? \Carbon\Carbon::parse($empresa->contrato_fecha_aceptacion)->format('d \d\e m \d\e Y, h:i A') : date('d/m/Y'),
            'ip' => $empresa->contrato_ip_aceptacion
        ];

        // Crear una vista HTML básica para el PDF (se puede mover a un archivo Blade más adelante)
        $html = '
        <div style="font-family: Helvetica, sans-serif; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2>CONTRATO DE LICENCIA Y PRESTACIÓN DE SERVICIOS SAAS</h2>
                <h3>GESTIVAPYME</h3>
            </div>
            
            <p>Entre los suscritos a saber, de una parte <strong>GestivaPyme S.A.S</strong>, actuando como el PRESTADOR, y de otra parte <strong>' . $empresa->razon_social . '</strong> identificada con NIT <strong>' . $empresa->nit . '</strong>, representada legalmente por <strong>' . $nombreGerente . '</strong> con documento <strong>' . $documentoGerente . '</strong>, quien en adelante se denominará EL CLIENTE, hemos convenido celebrar el presente contrato:</p>
            
            <h4>CLÁUSULA PRIMERA: OBJETO</h4>
            <p>El PRESTADOR otorga al CLIENTE el derecho de uso no exclusivo de la plataforma de gestión empresarial GestivaPyme, en su modalidad SaaS (Software as a Service) bajo el plan de suscripción <strong>' . ($empresa->plan_suscripcion ?: 'Básico') . '</strong>.</p>
            
            <h4>CLÁUSULA SEGUNDA: OBLIGACIONES Y USO</h4>
            <p>El CLIENTE se compromete a hacer un uso lícito de la herramienta, protegiendo sus credenciales de acceso. El PRESTADOR garantizará un uptime del 99.9% y respaldos regulares de la información.</p>
            
            <h4>CLÁUSULA TERCERA: PRIVACIDAD DE DATOS</h4>
            <p>Toda la información ingresada por EL CLIENTE será tratada con estricta confidencialidad y alojada en servidores seguros, cumpliendo con las normativas vigentes de protección de datos (Habeas Data).</p>
            
            <hr style="margin-top: 50px; margin-bottom: 30px;">
            <div style="text-align: center;">
                <p>Aceptado digitalmente el <strong>' . $data['fecha'] . '</strong> desde la IP <strong>' . $data['ip'] . '</strong>.</p>
                <div style="margin-top: 20px;">
                    ' . (extension_loaded('gd') && $empresa->contrato_firma_path ? '<img src="' . $empresa->contrato_firma_path . '" style="max-width: 250px; max-height: 150px; border-bottom: 1px solid #000; padding-bottom: 10px;">' : '<div style="width: 250px; height: 60px; border-bottom: 1px solid #000; margin: 0 auto;"></div>') . '
                </div>
                <p style="margin-top: 10px;"><strong>' . $nombreGerente . '</strong></p>
                <p>Representante Legal - ' . $empresa->razon_social . '</p>
            </div>
        </div>';

        $pdf = Pdf::loadHTML($html);
        return $pdf->download('Contrato_GestivaPyme_' . $empresa->nit . '.pdf');
    }
}
