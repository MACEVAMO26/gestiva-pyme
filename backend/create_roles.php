<?php
$empresas = App\Models\Empresa::with('modulos')->get();
foreach($empresas as $empresa) {
    foreach($empresa->modulos as $modulo) {
        if ($modulo->pivot->activo) {
            $nombreModulo = $modulo->nombre;
            $nombreRol = 'Jefe de ' . $nombreModulo;
            $rolExiste = App\Models\Role::where('empresa_id', $empresa->id)->where('nombre', $nombreRol)->exists();
            if (!$rolExiste) {
                App\Models\Role::create([
                    'empresa_id' => $empresa->id,
                    'nombre' => $nombreRol,
                    'descripcion' => '', // Dejado en blanco
                    'activo' => true,
                    'es_base' => true
                ]);
                echo 'Creado rol ' . $nombreRol . ' para empresa ' . $empresa->nombre . PHP_EOL;
            }
        }
    }
}
