<?php

namespace App\Http\Controllers;

use App\Models\Tarifa;
use Illuminate\Http\Request;

class TarifaController extends Controller
{
    public function index()
    {
        $tarifa = Tarifa::first();
        if (!$tarifa) {
            $tarifa = Tarifa::create(['plan_mensual' => 70000, 'modulo_extra' => 20000, 'addon_extra' => 10000]);
        }
        return response()->json($tarifa);
    }

    public function update(Request $request, $id)
    {
        $tarifa = Tarifa::findOrFail($id);
        $tarifa->update($request->only(['plan_mensual', 'modulo_extra', 'addon_extra']));
        return response()->json(['message' => 'Tarifas actualizadas', 'tarifa' => $tarifa]);
    }
}
