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
    // Obtiene la lista de todas las empresas registradas (incluye el nombre del gerente)
    public function index()
    {
        $empresas = Empresa::all();

        // Adjunta el gerente de cada empresa para que el SAAS admin pueda pre-cargar sus datos
        $empresas->each(function ($empresa) {
            $rolGerente = \App\Models\Role::where('empresa_id', $empresa->id)
                ->where('nombre', 'Gerente General')->first();
            $gerente = null;
            if ($rolGerente) {
                $gerente = \App\Models\User::where('empresa_id', $empresa->id)
                    ->where('rol_id', $rolGerente->id)
                    ->orderBy('id')->first();
            }
            $empresa->gerente = $gerente ? [
                'id' => $gerente->id,
                'primer_nombre' => $gerente->primer_nombre,
                'segundo_nombre' => $gerente->segundo_nombre,
                'primer_apellido' => $gerente->primer_apellido,
                'segundo_apellido' => $gerente->segundo_apellido,
            ] : null;
        });

        return response()->json($empresas);
    }

    // Obtiene las estadísticas de suscripciones y la lista detallada de empresas (MRR, clientes, morosos)
    public function suscripcionesStats()
    {
        $empresas = Empresa::with('tarifasCatalogo')->get();
        
        $mrr = $empresas->where('activo', 1)->sum('monto_mensual');
        $clientesActivos = $empresas->where('activo', 1)->count();
        $clientesMora = $empresas->where('activo', 1)->where('estado_pago', 'mora')->count();
        
        $crecimientoMensual = 12.5;

        $lista = $empresas->map(function ($emp) {
            $tipo = $emp->tipo_empresa;
            
            // Determinar módulos transversales activos basados en el catálogo
            $modulosExtra = $emp->tarifasCatalogo->where('tipo', 'modulo_adicional')->count();
            
            // Addons estructurados desde el catálogo
            $addons = $emp->tarifasCatalogo->where('tipo', 'addon')->map(function ($t) {
                return ['nombre' => $t->nombre, 'valor' => $t->pivot->valor_aplicado];
            })->values()->toArray();

            // Descuentos aplicados desde el catálogo
            $descuentos = $emp->tarifasCatalogo->where('tipo', 'descuento')->map(function ($t) {
                return ['descripcion' => $t->nombre, 'porcentaje' => $t->pivot->valor_aplicado];
            })->values()->toArray();

            // Desglose del carrito para el frontend
            $cartItems = $emp->tarifasCatalogo->map(function ($t) {
                return [
                    'id' => $t->id,
                    'cantidad' => $t->pivot->cantidad,
                    'valor_aplicado' => $t->pivot->valor_aplicado
                ];
            })->values()->toArray();

            return [
                'id' => $emp->id,
                'empresaId' => $emp->id,
                'nombreEmpresa' => $emp->razon_social,
                'fechaInscripcion' => $emp->fecha_inscripcion ? date('d/M/Y', strtotime($emp->fecha_inscripcion)) : date('d/M/Y'),
                'plan' => $emp->plan_suscripcion ?: 'Mensual',
                'tipoEmpresa' => $tipo,
                'modulosExtra' => $modulosExtra,
                'addonsList' => $addons,
                'descuentosAplicados' => $descuentos,
                'proximoPagoTotal' => $emp->monto_mensual ?: 0,
                'fechaProximoPago' => $emp->fecha_proximo_pago ?: date('Y-m-d', strtotime('+30 days')),
                'estado' => $emp->estado_pago === 'mora' ? 'En Mora' : ($emp->estado_pago === 'suspendido' ? 'Inactiva' : 'Activa'),
                'renovaciones' => $emp->renovaciones ?: 0,
                'cartItems' => $cartItems,
                'iaByokActivo' => (bool)$emp->ia_byok_activo,
                'iaByokProveedor' => $emp->ia_byok_proveedor,
                'iaByokModelo' => $emp->ia_byok_modelo,
                'iaByokKeyExists' => !empty($emp->ia_byok_key)
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

    // Actualiza las tarifas personalizadas de una empresa (Carrito de compras)
    public function updateTarifas(Request $request, $id)
    {
        $request->validate([
            'tipo_empresa' => 'required|in:Servicios,Ventas,Ventas y Servicios',
            'items' => 'required|array',
            'items.*.id' => 'required|exists:tarifas_catalogo,id',
            'items.*.cantidad' => 'required|integer|min:1',
            'ia_byok_activo' => 'required|boolean',
            'ia_byok_proveedor' => 'nullable|string',
            'ia_byok_key' => 'nullable|string',
            'ia_byok_modelo' => 'nullable|string',
        ]);

        $empresa = Empresa::findOrFail($id);
        
        $tipoEmpresa = $request->tipo_empresa;
        if ($tipoEmpresa === 'Mixto') {
            $tipoEmpresa = 'Ventas y Servicios';
        }

        // 1. Regla de Validación de Negocio: Módulos Adicionales sólo con paquete base
        $hasBasePackage = in_array($tipoEmpresa, ['Ventas', 'Servicios', 'Ventas y Servicios']);
        
        $subtotal = 0.00;
        $descuentoPorcentaje = 0.00;
        $planSeleccionado = 'Mensual';

        // Detach de las tarifas actuales
        $empresa->tarifasCatalogo()->detach();

        // 2. Procesar ítems del carrito
        foreach ($request->items as $itemData) {
            $tarifa = \App\Models\TarifaCatalogo::findOrFail($itemData['id']);

            // Validar restricción de módulos adicionales
            if ($tarifa->tipo === 'modulo_adicional' && !$hasBasePackage) {
                return response()->json([
                    'error' => 'No se pueden asignar módulos adicionales si el tipo de negocio base no está seleccionado.'
                ], 422);
            }

            // Calcular cobro según mecanismo
            if ($tarifa->mecanismo === 'fijo') {
                $subtotal += $tarifa->valor;
            } elseif ($tarifa->mecanismo === 'por_usuario') {
                $subtotal += ($tarifa->valor * $itemData['cantidad']);
            } elseif ($tarifa->mecanismo === 'porcentaje') {
                $descuentoPorcentaje += $tarifa->valor;
            }

            // Registrar plan base
            if ($tarifa->tipo === 'plan') {
                $planSeleccionado = str_replace('Plan ', '', $tarifa->nombre);
            }

            // Guardar en la tabla pivote
            $empresa->tarifasCatalogo()->attach($tarifa->id, [
                'cantidad' => $itemData['cantidad'],
                'valor_aplicado' => $tarifa->valor
            ]);
        }

        // Calcular descuentos
        $descuentoMonto = $subtotal * ($descuentoPorcentaje / 100);
        $totalCalculado = max(0, $subtotal - $descuentoMonto);

        // 3. Configuración de API de IA propia (BYOK)
        $empresa->ia_byok_activo = $request->ia_byok_activo;
        $empresa->ia_byok_proveedor = $request->ia_byok_proveedor;
        $empresa->ia_byok_modelo = $request->ia_byok_modelo;
        if ($request->filled('ia_byok_key')) {
            $empresa->ia_byok_key = \Illuminate\Support\Facades\Crypt::encryptString($request->ia_byok_key);
        }

        // 4. Guardar Empresa
        $empresa->tipo_empresa = $tipoEmpresa;
        $empresa->plan_suscripcion = $planSeleccionado;
        $empresa->monto_mensual = $totalCalculado;
        $empresa->save();

        // 5. Sincronizar Módulos y Áreas según la Suscripción Pagada
        app(\App\Http\Controllers\ModulosController::class)->sincronizarModulosPorSuscripcion($empresa);

        return response()->json([
            'message' => 'Suscripción y tarifas actualizadas con éxito.',
            'monto_mensual' => $totalCalculado
        ]);
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
        // 'Mixto' es un alias de presentación; la BD guarda 'Ventas y Servicios'
        if ($request->input('tipo_empresa') === 'Mixto') {
            $request->merge(['tipo_empresa' => 'Ventas y Servicios']);
        }

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
            'primer_nombre_gerente' => 'required|string|max:255',
            'segundo_nombre_gerente' => 'nullable|string|max:255',
            'primer_apellido_gerente' => 'required|string|max:255',
            'segundo_apellido_gerente' => 'required|string|max:255',
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

        // 'Mixto' es un alias de presentación; la BD guarda 'Ventas y Servicios'
        if ($request->input('tipo_empresa') === 'Mixto') {
            $request->merge(['tipo_empresa' => 'Ventas y Servicios']);
        }

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

        // Cambio de gerente desde el SAAS admin: actualiza los nombres del usuario gerente.
        // Regla: el gerente NO se elimina ni se inactiva; solo se le actualizan sus datos.
        $gerenteNombres = $request->only([
            'primer_nombre_gerente', 'segundo_nombre_gerente',
            'primer_apellido_gerente', 'segundo_apellido_gerente'
        ]);

        if (array_filter($gerenteNombres)) {
            $rolGerente = \App\Models\Role::where('empresa_id', $empresa->id)
                ->where('nombre', 'Gerente General')->first();

            if ($rolGerente) {
                $gerenteUser = User::where('empresa_id', $empresa->id)
                    ->where('rol_id', $rolGerente->id)
                    ->orderBy('id')->first();

                if ($gerenteUser) {
                    // Mínimo: un nombre y dos apellidos; el segundo nombre es opcional.
                    $primerNombre = trim($gerenteNombres['primer_nombre_gerente'] ?? '');
                    $primerApellido = trim($gerenteNombres['primer_apellido_gerente'] ?? '');
                    $segundoApellido = trim($gerenteNombres['segundo_apellido_gerente'] ?? '');

                    if ($primerNombre === '' || $primerApellido === '' || $segundoApellido === '') {
                        return response()->json([
                            'error' => 'Para cambiar el gerente se requieren: un nombre y dos apellidos (el segundo nombre es opcional).'
                        ], 422);
                    }

                    $gerenteUser->update([
                        'primer_nombre' => $primerNombre,
                        'segundo_nombre' => $gerenteNombres['segundo_nombre_gerente'] ? trim($gerenteNombres['segundo_nombre_gerente']) : null,
                        'primer_apellido' => $primerApellido,
                        'segundo_apellido' => $segundoApellido,
                    ]);
                }
            }
        }

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

    // Devuelve la configuración RRHH (ARL, Caja de Compensación) de la empresa
    public function getConfiguracionRRHH($id)
    {
        $empresa = Empresa::findOrFail($id);
        return response()->json([
            'empresa' => $empresa,
            'arl' => $empresa->arl,
            'caja_compensacion' => $empresa->caja_compensacion,
        ]);
    }

    // Guarda la configuración RRHH (ARL, Caja de Compensación) de la empresa
    public function updateConfiguracionRRHH(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

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
        
        if (!$empresa->contrato_id) {
            return response()->json(['error' => 'El contrato aún no ha sido firmado.'], 403);
        }

        // Obtener la versión específica del contrato que firmó
        $contrato = \App\Models\SaasContrato::find($empresa->contrato_id);
        $contenidoContrato = $contrato ? $contrato->contenido : '<p>Contrato no encontrado</p>';

        // Obtener al gerente de la empresa
        $gerente = User::where('empresa_id', $empresa->id)
            ->whereHas('rol', function($q) {
                $q->where('nombre', 'like', '%Gerente%');
            })->first();
            
        $nombreGerente = $gerente ? ($gerente->nombres . ' ' . $gerente->apellidos) : 'Representante Legal';
        $documentoGerente = $gerente ? $gerente->documento : 'N/A';

        // Estructura de datos para la vista del PDF
        $fechaFirmaFormateada = $empresa->fecha_firma ? \Carbon\Carbon::parse($empresa->fecha_firma)->format('d \d\e m \d\e Y, h:i A') : date('d/m/Y');
        
        // Obtener detalles de IA
        $detalleIa = '';
        if ($empresa->ia_byok_activo) {
            $detalleIa = 'Servicio IA Habilitado bajo el conector de API propia (BYOK) - Sin límites por GestivaPyme.';
        } else {
            $simpleUsers = \DB::table('empresa_tarifas')->where('empresa_id', $empresa->id)->where('tarifa_id', 'ia_simple')->value('cantidad') ?? 0;
            $advancedUsers = \DB::table('empresa_tarifas')->where('empresa_id', $empresa->id)->where('tarifa_id', 'ia_avanzada')->value('cantidad') ?? 0;
            $detalleIa = "Modo Simple: {$simpleUsers} usuarios (15 acciones/día); Modo Avanzado: {$advancedUsers} usuarios (bolsa de 2M tokens/mes, exceso a $15.000 COP por millón).";
        }

        // Mapear los placeholders para reemplazarlos dinámicamente
        $reemplazos = [
            '{CLIENTE_RAZON_SOCIAL}' => $empresa->razon_social,
            '{CLIENTE_NIT}' => $empresa->nit,
            '{CLIENTE_DIRECCION}' => $empresa->direccion ?: 'N/A',
            '{CLIENTE_CIUDAD}' => $empresa->ciudad ?: 'N/A',
            '{CLIENTE_GERENTE}' => $nombreGerente,
            '{CLIENTE_GERENTE_DOC}' => $documentoGerente,
            '{PLAN_CONTRATADO}' => $empresa->plan_suscripcion ?: 'Básico',
            '{TARIFA_MENSUAL}' => '$' . number_format($empresa->monto_mensual) . ' COP',
            '{FECHA_FIRMA}' => $fechaFirmaFormateada,
            '{DETALLE_IA}' => $detalleIa,
            
            // Datos del proveedor por defecto
            '{PROVEEDOR_NOMBRE}' => 'GestivaPyme S.A.S',
            '{PROVEEDOR_NIT}' => '901.456.789-0',
            '{PROVEEDOR_REPRESENTANTE}' => 'Representante Legal de GestivaPyme S.A.S',
            '{PROVEEDOR_DIRECCION}' => 'Calle 100 #15-30, Bogotá D.C.',
            '{PROVEEDOR_PAIS}' => 'Colombia'
        ];

        // Reemplazar marcadores en el contenido
        $contenidoContrato = str_replace(array_keys($reemplazos), array_values($reemplazos), $contenidoContrato);

        $firmaSrc = $empresa->firma_gerente_url; // Base64 desde frontend

        // Crear una vista HTML para el PDF usando el texto dinámico procesado
        $html = '
        <div style="font-family: Helvetica, sans-serif; padding: 20px;">
            <div style="margin-bottom: 20px; text-align: right; color: #666; font-size: 11px;">
                Versión del Documento: v' . ($contrato ? $contrato->version : '1.0') . '<br>
                Fecha de Aceptación: ' . $fechaFirmaFormateada . '
            </div>
            
            <div style="text-align: justify; line-height: 1.5; font-size: 12px; color: #1e293b;">
                ' . $contenidoContrato . '
            </div>
            
            <hr style="margin-top: 50px; margin-bottom: 30px; border: 0; border-top: 1px solid #cbd5e1;">
            <div style="text-align: center;">
                <p style="font-size: 11px; color: #64748b;">Aceptado digitalmente el <strong>' . $fechaFirmaFormateada . '</strong>.</p>
                <div style="margin-top: 20px;">
                    ' . ($firmaSrc ? '<img src="' . $firmaSrc . '" style="max-width: 250px; max-height: 100px; border-bottom: 1px solid #000; padding-bottom: 5px;">' : '<div style="width: 250px; height: 60px; border-bottom: 1px solid #000; margin: 0 auto;"></div>') . '
                </div>
                <p style="margin-top: 10px; font-size: 13px; font-weight: bold; color: #0f172a;"><strong>' . $nombreGerente . '</strong></p>
                <p style="font-size: 11px; color: #475569;">Representante Legal - ' . $empresa->razon_social . '</p>
            </div>
        </div>';

        $pdf = Pdf::loadHTML($html);
        return $pdf->download('Contrato_GestivaPyme_' . $empresa->nit . '.pdf');
    }
}
