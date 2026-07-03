<?php

namespace App\Http\Controllers;

use App\Models\LogAuditoria;
use Illuminate\Http\Request;

class LogAuditoriaController extends Controller
{
    // Listar
    
    public function index()
    {
        return LogAuditoria::with('usuario')
                           ->orderBy('created_at', 'desc')
                           ->take(500)
                           ->get();
    }

    // Mostrar
    
    public function show($id)
    {
        return LogAuditoria::with('usuario')->findOrFail($id);
    }

    // Sin métodos de escritura o eliminación.
}