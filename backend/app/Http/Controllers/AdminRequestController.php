<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdminRequest;
use Illuminate\Support\Facades\Auth;

class AdminRequestController extends Controller
{
    public function index()
    {
        return response()->json(AdminRequest::with('empresa')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|string',
            'banco' => 'nullable|string',
            'comprobante' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120' // 5MB max
        ]);
        
        $user = Auth::user();
        $empresa_id = $user ? $user->empresa_id : null;

        $comprobantePath = null;
        if ($request->hasFile('comprobante')) {
            $comprobantePath = $request->file('comprobante')->store('comprobantes', 'public');
        }

        $req = AdminRequest::create([
            'empresa_id' => $empresa_id,
            'tipo' => $validated['tipo'],
            'estado' => 'pendiente',
            'banco_origen' => $validated['banco'] ?? null,
            'comprobante_path' => $comprobantePath,
            'notas_propietaria' => null
        ]);

        return response()->json($req, 201);
    }

    public function process(Request $request, $id)
    {
        $req = AdminRequest::findOrFail($id);
        
        $validated = $request->validate([
            'accion' => 'required|in:aprobado,rechazado',
            'mensaje' => 'nullable|string'
        ]);

        $req->estado = $validated['accion'];
        $req->notas_propietaria = $validated['mensaje'] ?? null;
        $req->save();

        return response()->json($req);
    }
}
