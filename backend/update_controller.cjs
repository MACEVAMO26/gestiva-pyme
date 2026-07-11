const fs = require('fs');
const file = 'c:/Users/LADYMARY/Documents/PROYECTO - SENA/APLICATIVO/GESTIVAPYME/backend/app/Http/Controllers/EmpresaController.php';
let content = fs.readFileSync(file, 'utf8');

const regexSuscripcionesStats = /public function suscripcionesStats\(\)[\s\S]*?return response\(\)->json\(\[\n\s*'stats'[\s\S]*?\]\);\n    \}/;

const newSuscripcionesStats = `public function suscripcionesStats()
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
    }`;

content = content.replace(regexSuscripcionesStats, newSuscripcionesStats);
fs.writeFileSync(file, content);
console.log('EmpresaController updated!');
