<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EmpresaController extends Controller
{
    // Listar todas las empresas
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
        
        // Crecimiento mockeado o basado en fechas de creación (ej. % de empresas creadas este mes)
        // Para simplificar, un dato estático por ahora o calculado
        $crecimientoMensual = 12.5;

        $lista = $empresas->map(function ($emp) {
            return [
                'id' => $emp->id,
                'empresa' => $emp->razon_social,
                'plan' => $emp->plan_suscripcion ?: 'Básico',
                'estado' => $emp->estado_pago === 'mora' ? 'En Mora' : ($emp->estado_pago === 'suspendido' ? 'Suspendido' : 'Al Día'),
                'proximoPago' => $emp->fecha_proximo_pago ?: date('Y-m-d', strtotime('+30 days')),
                'valor' => $emp->monto_mensual
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

    public function systemStats()
    {
        // Encontrar la última actividad global del sistema usando los usuarios
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

    // Crear Empresa y su Gerente Automáticamente
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
        ]);

        // Inicia transacción para asegurar que ambos (empresa y usuario) se creen juntos
        DB::beginTransaction();
        try {
            // Crea la empresa
            $empresa = Empresa::create($validatedData);

            // Genera el email del administrador basado en el ID de la empresa
            $adminEmail = 'sadmin-id' . $empresa->id . '@gestivapyme.com';

            // Crea el usuario Gerente para esta empresa
            User::create([
                'empresa_id' => $empresa->id,
                'rol_id' => 1,
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

    // Mostrar
    public function show($id)
    {
        return response()->json(Empresa::findOrFail($id));
    }

    // Actualizar
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
        ]);

        $empresa->update($validatedData);
        return response()->json($empresa);
    }

    // Cambiar estado activo/inactivo
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