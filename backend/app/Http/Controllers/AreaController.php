<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Area;

class AreaController extends Controller
{
    public function index()
    {
        // Trae las areas de la empresa del usuario
        $empresaId = auth()->user()->empresa_id;
        return response()->json(Area::where('empresa_id', $empresaId)->get());
    }
}
