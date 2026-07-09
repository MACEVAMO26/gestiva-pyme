<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- CONTROLADORES DE LA APLICACION ---

// Autenticacion y Seguridad
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CargoController;
use App\Http\Controllers\PermisoController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AutogestionController;

// Gestion Central del Negocio
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ServicioController;

// Operaciones Comerciales
use App\Http\Controllers\OrdenCompraController;
use App\Http\Controllers\CotizacionPedidoController;
use App\Http\Controllers\MovimientoInventarioController;


// --- RUTAS PUBLICAS ---
Route::post('/login', [AuthController::class, 'login']);
Route::post('/leads', [\App\Http\Controllers\LeadController::class, 'store']);
Route::post('/change-initial-password', [AuthController::class, 'changeInitialPassword']);


// Modulos
Route::get('/empresas/{id}/modulos', [\App\Http\Controllers\ModulosController::class, 'getModulosPorEmpresa']);
Route::post('/empresas/{id}/modulos/{moduloId}/toggle', [\App\Http\Controllers\ModulosController::class, 'toggleModuloEmpresa']);
Route::post('/empresas/{id}/modulos/paquete', [\App\Http\Controllers\ModulosController::class, 'updatePaqueteEmpresa']);

// Rutas Globales de Módulos (Master)
Route::post('/modulos', [\App\Http\Controllers\ModulosController::class, 'store']);
Route::put('/modulos/{id}', [\App\Http\Controllers\ModulosController::class, 'update']);
Route::delete('/modulos/{id}', [\App\Http\Controllers\ModulosController::class, 'destroy']);

// --- RUTAS PROTEGIDAS (Requieren Token) ---

Route::middleware('auth:sanctum')->group(function () {
    
    // --- SESION ---
    Route::post('/logout', [AuthController::class, 'cerrarSesion']);
    Route::get('/user', function (Request $request) {

        return $request->user();
    });

    // --- SEGURIDAD Y ACCESO ---


    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::patch('/roles/{id}/status', [RoleController::class, 'changeStatus']);


    Route::get('/cargos', [CargoController::class, 'index']);
    Route::post('/cargos', [CargoController::class, 'store']);
    Route::get('/cargos/{id}', [CargoController::class, 'show']);
    Route::put('/cargos/{id}', [CargoController::class, 'update']);
    Route::patch('/cargos/{id}/status', [CargoController::class, 'changeStatus']);


    Route::get('/permisos', [PermisoController::class, 'index']);
    Route::post('/permisos', [PermisoController::class, 'store']);
    Route::get('/permisos/{id}', [PermisoController::class, 'show']);
    Route::put('/permisos/{id}', [PermisoController::class, 'update']);
    Route::delete('/permisos/{id}', [PermisoController::class, 'destroy']);


    Route::post('/user/avatar', [UserController::class, 'uploadAvatar']);
    Route::apiResource('usuarios', UserController::class);
    Route::patch('usuarios/{id}/status', [UserController::class, 'changeStatus']);


    Route::get('/autogestion/afiliaciones', [AutogestionController::class, 'misAfiliaciones']);
    Route::post('/autogestion/afiliaciones', [AutogestionController::class, 'guardarAfiliaciones']);


    Route::get('/autogestion/empleado/{id}/afiliaciones', [AutogestionController::class, 'obtenerAfiliacionEmpleado']);
    Route::post('/autogestion/empleado/{id}/afiliaciones', [AutogestionController::class, 'gestionarAfiliacionEmpleado']);


    // --- GESTION CENTRAL (Maestros) ---


    Route::get('empresas/stats/suscripciones', [EmpresaController::class, 'suscripcionesStats']);
    Route::get('empresas/stats/system', [EmpresaController::class, 'systemStats']);
    Route::apiResource('empresas', EmpresaController::class);
    Route::patch('empresas/{id}/status', [EmpresaController::class, 'changeStatus']);
    Route::patch('empresas/{id}/renovar', [EmpresaController::class, 'registrarRenovacion']);
    Route::patch('empresas/{id}/norenovar', [EmpresaController::class, 'noRenovar']);

    Route::apiResource('tarifas', \App\Http\Controllers\TarifaController::class);

    Route::get('/admin-requests/my-requests', [\App\Http\Controllers\AdminRequestController::class, 'misSolicitudes']);
    Route::get('/admin-requests', [\App\Http\Controllers\AdminRequestController::class, 'index']);
    Route::post('/admin-requests', [\App\Http\Controllers\AdminRequestController::class, 'store']);
    Route::patch('/admin-requests/{id}/process', [\App\Http\Controllers\AdminRequestController::class, 'process']);

    Route::get('/leads', [\App\Http\Controllers\LeadController::class, 'index']);
    Route::patch('/leads/{id}', [\App\Http\Controllers\LeadController::class, 'update']);
    Route::delete('/leads/{id}', [\App\Http\Controllers\LeadController::class, 'destroy']);
    Route::post('/comercial/enviar-masivo', [\App\Http\Controllers\LeadController::class, 'enviarMasivo']);


    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('proveedores', ProveedorController::class);
    Route::apiResource('productos', ProductoController::class);
    Route::apiResource('servicios', ServicioController::class);


    // --- OPERACIONES COMERCIALES ---

    Route::apiResource('ordenes-compra', OrdenCompraController::class);
    Route::apiResource('cotizaciones-pedidos', CotizacionPedidoController::class);
    Route::apiResource('movimientos-inventario', MovimientoInventarioController::class);


    // --- INVENTARIO FISICO ---


    Route::apiResource('inventario', \App\Http\Controllers\InventarioController::class);
   

    // --- TURNOS ---


    Route::get('/turnos', [\App\Http\Controllers\TurnoController::class, 'index']);
    Route::post('/turnos', [\App\Http\Controllers\TurnoController::class, 'store']);
    Route::get('/turnos/{id}', [\App\Http\Controllers\TurnoController::class, 'show']);
    Route::put('/turnos/{id}', [\App\Http\Controllers\TurnoController::class, 'update']);
    Route::patch('/turnos/{id}/status', [\App\Http\Controllers\TurnoController::class, 'changeStatus']);
    

    Route::post('/turnos/{id}/asignar', [\App\Http\Controllers\TurnoController::class, 'asignarTurno']);

    // --- VACACIONES ---
    Route::get('/vacaciones', [\App\Http\Controllers\VacacionController::class, 'index']);
    Route::post('/vacaciones', [\App\Http\Controllers\VacacionController::class, 'store']);
    Route::get('/vacaciones/{id}', [\App\Http\Controllers\VacacionController::class, 'show']);
    Route::put('/vacaciones/{id}', [\App\Http\Controllers\VacacionController::class, 'update']);
    

    Route::patch('/vacaciones/{id}/responder', [\App\Http\Controllers\VacacionController::class, 'responderSolicitud']);

    // --- UTILIDAD ---

    // --- NOTIFICACIONES ---
    

    Route::get('/notificaciones', [\App\Http\Controllers\NotificacionController::class, 'index']);
    Route::post('/notificaciones', [\App\Http\Controllers\NotificacionController::class, 'store']);
    Route::delete('/notificaciones/{id}/leida', [\App\Http\Controllers\NotificacionController::class, 'marcarLeida']);

    // --- LOGS DE AUDITORIA ---
    

    Route::get('/logs', [\App\Http\Controllers\LogAuditoriaController::class, 'index']);
    Route::get('/logs/{id}', [\App\Http\Controllers\LogAuditoriaController::class, 'show']);


    // --- PERMISOS POR ROL ---
    Route::get('/roles/{id}/permisos', function ($id) {
        $rol = \App\Models\Role::with('permisos')->findOrFail($id);
        return $rol->permisos;    
    });

});