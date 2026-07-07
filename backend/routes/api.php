<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controladores de la Aplicación

// --- Controladores para Autenticación y Seguridad ---
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\CargoController;
use App\Http\Controllers\PermisoController;
use App\Http\Controllers\UserController;

// --- Controladores para la Gestión Central del Negocio ---
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ServicioController;

// --- Controladores para Operaciones Comerciales ---
use App\Http\Controllers\OrdenCompraController;
use App\Http\Controllers\CotizacionPedidoController;
use App\Http\Controllers\MovimientoInventarioController;


// Rutas de la API

// Rutas Públicas

// Rutas PÚBLICAS
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

// Rutas Protegidas (Requieren token)

Route::middleware('auth:sanctum')->group(function () {
    
    // --- Gestión de Sesión ---
    Route::post('/logout', [AuthController::class, 'cerrarSesion']);
    Route::get('/user', function (Request $request) {
        // Retorna datos de usuario auth
        return $request->user();
    });

    // ---------------------------------------------------------------------
    // --- MÓDULO: SEGURIDAD Y ACCESO ---
    // ---------------------------------------------------------------------

    // Gestión de Roles
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{id}', [RoleController::class, 'show']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::patch('/roles/{id}/status', [RoleController::class, 'changeStatus']);

    // --- Gestión de Cargos (CRIU Manual) ---
    Route::get('/cargos', [CargoController::class, 'index']);
    Route::post('/cargos', [CargoController::class, 'store']);
    Route::get('/cargos/{id}', [CargoController::class, 'show']);
    Route::put('/cargos/{id}', [CargoController::class, 'update']);
    Route::patch('/cargos/{id}/status', [CargoController::class, 'changeStatus']);

    // Gestión de Permisos
    Route::get('/permisos', [PermisoController::class, 'index']);
    Route::post('/permisos', [PermisoController::class, 'store']);
    Route::get('/permisos/{id}', [PermisoController::class, 'show']);
    Route::put('/permisos/{id}', [PermisoController::class, 'update']);
    Route::delete('/permisos/{id}', [PermisoController::class, 'destroy']);

    // Gestión de Usuarios
    Route::apiResource('usuarios', UserController::class);
    Route::patch('usuarios/{id}/status', [UserController::class, 'changeStatus']);


    // ---------------------------------------------------------------------
    // --- MÓDULO: GESTIÓN CENTRAL (Maestros) ---
    // ---------------------------------------------------------------------

    // --- Gestión de Empresas ---
    Route::get('empresas/stats/suscripciones', [EmpresaController::class, 'suscripcionesStats']);
    Route::get('empresas/stats/system', [EmpresaController::class, 'systemStats']);
    Route::apiResource('empresas', EmpresaController::class);
    Route::patch('empresas/{id}/status', [EmpresaController::class, 'changeStatus']);

    Route::get('/admin-requests', [\App\Http\Controllers\AdminRequestController::class, 'index']);
    Route::post('/admin-requests', [\App\Http\Controllers\AdminRequestController::class, 'store']);
    Route::patch('/admin-requests/{id}/process', [\App\Http\Controllers\AdminRequestController::class, 'process']);

    Route::get('/leads', [\App\Http\Controllers\LeadController::class, 'index']);
    Route::patch('/leads/{id}', [\App\Http\Controllers\LeadController::class, 'update']);
    Route::delete('/leads/{id}', [\App\Http\Controllers\LeadController::class, 'destroy']);
    Route::post('/comercial/enviar-masivo', [\App\Http\Controllers\LeadController::class, 'enviarMasivo']);

    // Maestros
    Route::apiResource('categorias', CategoriaController::class);
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('proveedores', ProveedorController::class);
    Route::apiResource('productos', ProductoController::class);
    Route::apiResource('servicios', ServicioController::class);


    // ---------------------------------------------------------------------
    // --- MÓDULO: OPERACIONES COMERCIALES ---
    // ---------------------------------------------------------------------

    Route::apiResource('ordenes-compra', OrdenCompraController::class);
    Route::apiResource('cotizaciones-pedidos', CotizacionPedidoController::class);
    Route::apiResource('movimientos-inventario', MovimientoInventarioController::class);


    // ---------------------------------------------------------------------
    // --- MÓDULO: INVENTARIO FÍSICO ---
    // ---------------------------------------------------------------------

    // Inventario físico
    Route::apiResource('inventario', \App\Http\Controllers\InventarioController::class);
   

    // ---------------------------------------------------------------------
    // --- MÓDULO: GESTIÓN DE TIEMPOS (Turnos) ---
    // ---------------------------------------------------------------------

    // Turnos
    Route::get('/turnos', [\App\Http\Controllers\TurnoController::class, 'index']);
    Route::post('/turnos', [\App\Http\Controllers\TurnoController::class, 'store']);
    Route::get('/turnos/{id}', [\App\Http\Controllers\TurnoController::class, 'show']);
    Route::put('/turnos/{id}', [\App\Http\Controllers\TurnoController::class, 'update']);
    Route::patch('/turnos/{id}/status', [\App\Http\Controllers\TurnoController::class, 'changeStatus']);
    
    // Asignación de turno
    Route::post('/turnos/{id}/asignar', [\App\Http\Controllers\TurnoController::class, 'asignarTurno']);

    // ---------------------------------------------------------------------
    // --- MÓDULO: GESTIÓN DE TIEMPOS (Vacaciones) ---
    // ---------------------------------------------------------------------
    Route::get('/vacaciones', [\App\Http\Controllers\VacacionController::class, 'index']);
    Route::post('/vacaciones', [\App\Http\Controllers\VacacionController::class, 'store']);
    Route::get('/vacaciones/{id}', [\App\Http\Controllers\VacacionController::class, 'show']);
    Route::put('/vacaciones/{id}', [\App\Http\Controllers\VacacionController::class, 'update']);
    
    // Ruta Especial para el Administrador
    // Endpoint: PATCH /api/vacaciones/1/responder
    Route::patch('/vacaciones/{id}/responder', [\App\Http\Controllers\VacacionController::class, 'responderSolicitud']);

    // ---------------------------------------------------------------------
    // --- RUTAS DE UTILIDAD ---
    // Endpoints especiales que nos dan información relacionada.
    // ---------------------------------------------------------------------

    // ---------------------------------------------------------------------
    // --- MÓDULO: SISTEMA (Notificaciones) ---
    // ---------------------------------------------------------------------
    
    // Notificaciones
    Route::get('/notificaciones', [\App\Http\Controllers\NotificacionController::class, 'index']);
    Route::post('/notificaciones', [\App\Http\Controllers\NotificacionController::class, 'store']);
    Route::delete('/notificaciones/{id}/leida', [\App\Http\Controllers\NotificacionController::class, 'marcarLeida']);

    // ---------------------------------------------------------------------
    // --- MÓDULO: SISTEMA (Logs de Auditoría) ---
    // ---------------------------------------------------------------------
    
    // Logs (Solo Lectura)
    Route::get('/logs', [\App\Http\Controllers\LogAuditoriaController::class, 'index']);
    Route::get('/logs/{id}', [\App\Http\Controllers\LogAuditoriaController::class, 'show']);


    // Permisos por rol
    Route::get('/roles/{id}/permisos', function ($id) {
        $rol = \App\Models\Role::with('permisos')->findOrFail($id);
        return $rol->permisos;    
    });

});