<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$roles = App\Models\Role::where('nombre', 'Gerente General')->get();
foreach ($roles as $rol) {
    $cargo = App\Models\Cargo::where('rol_id', $rol->id)->first();
    if ($cargo) {
        App\Models\User::where('rol_id', $rol->id)->update([
            'perfil_formalizado' => 1,
            'cargo_id' => $cargo->id
        ]);
        echo "Fixed user for rol {$rol->id}\n";
    }
}
