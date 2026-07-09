<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    use HasFactory;

    // --- TABLA ---

    protected $table = 'permisos';

    // --- TIMESTAMPS ---
    
    public $timestamps = false;

    // --- CAMPOS ---
    
    protected $fillable = [
        'rol_id',
        'modulo',
        'puede_ver',
        'puede_crear',
        'puede_editar',
        'puede_inactivar'
    ];

    
    // --- RELACIONES ---
    
    public function rol()
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }
}