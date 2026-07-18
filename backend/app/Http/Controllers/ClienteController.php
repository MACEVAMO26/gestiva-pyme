<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;

class ClienteController extends Controller
{
    public function index()
    {
        $empresaId = request()->header('X-Empresa-Id');
        if (!$empresaId) {
            return response()->json(['error' => 'Empresa no especificada'], 400);
        }

        $clientes = Cliente::where('empresa_id', $empresaId)
            ->where('activo', 1)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($clientes);
    }

    public function store(Request $request)
    {
        $empresaId = $request->header('X-Empresa-Id');
        if (!$empresaId) {
            return response()->json(['error' => 'Empresa no especificada'], 400);
        }

        $validated = $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'documento' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:50',
            'tipo_cliente' => 'nullable|string|max:50',
            'membresia' => 'nullable|string|max:100',
            'pedidos_activos' => 'nullable|integer',
            'estado_pedido' => 'nullable|string|max:100',
            'estado_financiero' => 'nullable|string|max:100',
            'comentarios' => 'nullable|string',
        ]);

        $validated['empresa_id'] = $empresaId;
        $validated['nombre_razon_social'] = $validated['nombres'] . ' ' . ($validated['apellidos'] ?? '');
        $validated['activo'] = 1;

        $cliente = Cliente::create($validated);

        return response()->json(['message' => 'Cliente creado exitosamente', 'cliente' => $cliente]);
    }

    public function update(Request $request, $id)
    {
        $cliente = Cliente::findOrFail($id);

        $validated = $request->validate([
            'nombres' => 'required|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'documento' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:50',
            'tipo_cliente' => 'nullable|string|max:50',
            'membresia' => 'nullable|string|max:100',
            'pedidos_activos' => 'nullable|integer',
            'estado_pedido' => 'nullable|string|max:100',
            'estado_financiero' => 'nullable|string|max:100',
            'comentarios' => 'nullable|string',
        ]);

        $validated['nombre_razon_social'] = $validated['nombres'] . ' ' . ($validated['apellidos'] ?? '');

        $cliente->update($validated);

        return response()->json(['message' => 'Cliente actualizado exitosamente', 'cliente' => $cliente]);
    }

    public function destroy($id)
    {
        $cliente = Cliente::findOrFail($id);
        $cliente->activo = 0;
        $cliente->fecha_inactivacion = now();
        $cliente->save();

        return response()->json(['message' => 'Cliente eliminado exitosamente']);
    }
}
