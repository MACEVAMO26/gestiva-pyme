<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    // --- TABLA ---

    protected $table = 'empresa';

    // --- TIMESTAMPS ---
    
    public $timestamps = false;

    // --- CAMPOS ---
    
    protected $fillable = [
        'razon_social',
        'nit',
        'tipo_empresa',
        'direccion',
        'telefono',
        'email',
        'logo_url',
        'color_primario',
        'ciudad',
        'activo',
        'estado_pago',
        'inactive_at',
        'plan_suscripcion',
        'monto_mensual',
        'fecha_proximo_pago',
        'last_activity_at',
        'estado_servidor',
        'ultimo_ping',
        'fecha_inscripcion',
        'renovaciones',
        'descuento',
        'periodo'
    ];

    public function modulos()
    {
        return $this->belongsToMany(Modulo::class, 'empresa_modulo')
                    ->withPivot('activo')
                    ->withTimestamps();
    }
}