<?php
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\Usuario;

$roleSuperAdmin = Role::firstOrCreate(['nombre' => 'Superadmin'], ['descripcion' => 'Administrador del SaaS']);
$roleGerente = Role::firstOrCreate(['nombre' => 'Gerente'], ['descripcion' => 'Gerente de Empresa Cliente']);

Usuario::firstOrCreate(
    ['email' => 'SAAS_propietaria@gestivapyme.com'],
    [
        'nombres' => 'Administradora',
        'apellidos' => 'SaaS',
        'documento' => '000000000',
        'password_hash' => Hash::make('Admin_123'),
        'rol_id' => $roleSuperAdmin->id,
        'activo' => true,
        'debe_cambiar_clave' => false
    ]
);
echo 'SuperAdmin y roles creados con exito.';
