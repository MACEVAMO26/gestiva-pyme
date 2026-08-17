<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== EMPRESAS ===\n";
$empresas = DB::table('empresa')->get(['id','razon_social','dominio','tipo_empresa','activo']);
foreach ($empresas as $e) {
    echo "{$e->id} | {$e->razon_social} | dominio={$e->dominio} | tipo={$e->tipo_empresa} | activo={$e->activo}\n";
}

echo "\n=== EMPRESA_MODULO ===\n";
$pivots = DB::table('empresa_modulo')->select('empresa_id','modulo_id','activo')->orderBy('empresa_id')->get();
foreach ($pivots as $p) {
    echo "{$p->empresa_id} | {$p->modulo_id} | activo=".var_export($p->activo, true)."\n";
}