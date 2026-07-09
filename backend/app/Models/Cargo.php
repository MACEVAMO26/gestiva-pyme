<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cargo extends Model
{
    use HasFactory;

    
    // --- TABLA ---

    protected $table = 'cargos';

   
    // --- TIMESTAMPS ---

    public $timestamps = false;

   
    // --- CAMPOS ---
    
    protected $fillable = [
        'empresa_id',
        'rol_id',
        'nombre',
        'descripcion',
        'funciones',
        'activo',
        'fecha_inactivacion'
    ];
}