<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Venta;
use App\Models\VentaDetalle;
use App\Models\Inventario;
use App\Models\Cliente;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReciboVentaMail;
use Illuminate\Support\Facades\Auth;

class VentaController extends Controller
{
    public function index()
    {
        $ventas = Venta::where('activo', true)->orderBy('created_at', 'desc')->get();
        // Here we could eager load 'cliente' if Venta had a relation, assuming it does or we just return them.
        return response()->json($ventas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'metodo_pago' => 'required|string',
            'productos' => 'required|array',
            'productos.*.id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
            'productos.*.precio_unitario' => 'required|numeric',
        ]);

        try {
            DB::beginTransaction();

            $total = 0;
            foreach ($request->productos as $p) {
                $total += $p['cantidad'] * $p['precio_unitario'];
            }

            $venta = Venta::create([
                'total' => $total,
                'metodo_pago' => $request->metodo_pago,
                'estado' => 'Completada',
                'estado_paquete' => 'Preparando',
                'vendedor_id' => Auth::id(),
                'activo' => true
            ]);

            foreach ($request->productos as $p) {
                VentaDetalle::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $p['id'],
                    'cantidad' => $p['cantidad'],
                    'precio_unitario' => $p['precio_unitario'],
                    'subtotal' => $p['cantidad'] * $p['precio_unitario']
                ]);

                // Descontar inventario
                $inventario = Inventario::where('producto_id', $p['id'])->first();
                if ($inventario) {
                    $inventario->cantidad_disponible -= $p['cantidad'];
                    $inventario->save();

                    // Notificación de stock bajo (umbral de 10)
                    if ($inventario->cantidad_disponible <= 10) {
                        $producto = \App\Models\Producto::find($p['id']);
                        \App\Models\Notificacion::create([
                            'usuario_id' => Auth::id(), // Notificar al vendedor actual (idealmente sería a los administradores)
                            'titulo' => 'Alerta de Stock Bajo',
                            'mensaje' => 'El producto "' . ($producto ? $producto->nombre : 'ID '.$p['id']) . '" tiene un stock bajo (' . $inventario->cantidad_disponible . ' unidades restantes).',
                            'leida' => false
                        ]);
                    }
                }
            }

            DB::commit();

            // Enviar correo al cliente
            $cliente = Cliente::find($request->cliente_id);
            if ($cliente && $cliente->email) {
                try {
                    Mail::to($cliente->email)->send(new ReciboVentaMail($venta, $cliente));
                } catch (\Exception $e) {
                    \Log::error('No se pudo enviar recibo de venta: ' . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Venta registrada con éxito',
                'venta' => $venta
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al registrar la venta', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateEstadoPaquete(Request $request, $id)
    {
        $request->validate([
            'estado_paquete' => 'required|in:Preparando,En camino,Entregado',
            'cliente_id' => 'required|exists:clientes,id' // para saber a quien notificar
        ]);

        $venta = Venta::findOrFail($id);
        $venta->estado_paquete = $request->estado_paquete;
        $venta->save();

        $cliente = Cliente::find($request->cliente_id);
        if ($cliente && $cliente->email) {
            try {
                // Se reutiliza el mailable o se crea uno nuevo (ej. EstadoPaqueteMail)
                // Para mantenerlo simple, usaremos el mismo o le pasaremos una variable extra en el futuro
                Mail::to($cliente->email)->send(new ReciboVentaMail($venta, $cliente, true));
            } catch (\Exception $e) {
                \Log::error('No se pudo enviar actualización de estado de paquete: ' . $e->getMessage());
            }
        }

        return response()->json(['message' => 'Estado del paquete actualizado', 'venta' => $venta]);
    }
}
