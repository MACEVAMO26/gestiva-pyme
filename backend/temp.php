<?php
$e = App\Models\Empresa::where('razon_social', 'like', '%TechVenta%')->first();
if ($e) {
    echo json_encode([
        'empresa' => $e->toArray(),
        'tarifas' => $e->tarifasCatalogo->toArray(),
        'modulos' => DB::table('empresa_modulo')->where('empresa_id', $e->id)->get()->toArray()
    ]);
} else {
    echo "Empresa no encontrada";
}
