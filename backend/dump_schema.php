<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tables = ['categorias', 'servicios', 'cotizaciones_pedidos', 'cotizaciones_pedidos_detalles', 'cajas', 'caja_movimientos', 'calendario_eventos', 'servicios_tickets', 'tickets_materiales'];
foreach ($tables as $t) {
    echo "===== $t =====" . PHP_EOL;
    if (!Illuminate\Support\Facades\Schema::hasTable($t)) { echo "(no existe)" . PHP_EOL; continue; }
    $cols = Illuminate\Support\Facades\DB::select("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = ? ORDER BY ordinal_position", [$t]);
    foreach ($cols as $c) {
        echo "  {$c->column_name} ({$c->data_type}, null={$c->is_nullable})" . PHP_EOL;
    }
}
