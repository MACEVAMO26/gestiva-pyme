<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    // Tabla

    protected $table = 'empresa';

    // Timestamps
    
    public $timestamps = false;

    // Campos
    
    protected $fillable = [
        'razon_social',
        'nit',
        'tipo_empresa',
        'direccion',
        'telefono',
        'email',
        'logo_url',        // <-- NUEVO
        'color_primario',  // <-- NUEVO
        'ciudad',
        'activo',
        'estado_servidor',
        'ultimo_ping'
    ];

    public function modulos()
    {
        return $this->belongsToMany(Modulo::class, 'empresa_modulo')
                    ->withPivot('activo')
                    ->withTimestamps();
    }
}