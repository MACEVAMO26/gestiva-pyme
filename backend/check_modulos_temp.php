<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n=== USUARIOS (columnas) ===\n";
$cols = DB::select("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='usuarios' ORDER BY ordinal_position");
foreach ($cols as $c) { echo $c->column_name . "\n"; }

echo "\n=== USUARIOS ===\n";
$users = DB::table('usuarios')->select('id','empresa_id','email','primer_nombre','primer_apellido','rol_id','activo','perfil_formalizado')->get();
foreach ($users as $u) {
    echo "{$u->id} | empresa={$u->empresa_id} | {$u->email} | {$u->primer_nombre} {$u->primer_apellido} | rol={$u->rol_id} | activo={$u->activo} | formalizado={$u->perfil_formalizado}\n";
}

echo "\n=== ROLES ===\n";
$roles = DB::table('roles')->get();
foreach ($roles as $r) {
    echo "{$r->id} | empresa={$r->empresa_id} | {$r->nombre} | activo={$r->activo}\n";
}
