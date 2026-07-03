<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    use HasFactory;

    // Tabla

    protected $table = 'permisos';

    // Timestamps
    
    public $timestamps = false;

    // Campos
    
    protected $fillable = [
        'rol_id',
        'modulo',
        'puede_ver',
        'puede_crear',
        'puede_editar',
        'puede_inactivar'
    ];

    
    // Relaciones
    
    public function rol()
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }
}