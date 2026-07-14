<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/install-db', function() { try { \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]); return '¡BASE DE DATOS INSTALADA CON EXITO! Ya puedes ir a Vercel.'; } catch (\Exception $e) { return 'ERROR: ' . $e->getMessage(); } });
