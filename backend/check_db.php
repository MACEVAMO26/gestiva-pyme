<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$empresa = DB::connection('mysql')->table('empresas')->where('nombre', 'like', '%Tech%')->first();
if (!$empresa) {
    echo "No techventas found\n";
    exit;
}
echo "Empresa ID: " . $empresa->id . "\n";

$controller = new \App\Http\Controllers\ModulosController();
$response = $controller->getModulosPorEmpresa($empresa->id);
echo $response->content() . "\n";
