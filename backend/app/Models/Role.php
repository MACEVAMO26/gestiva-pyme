<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    // --- TIMESTAMPS ---
      
    public $timestamps = false;
 
    // --- CAMPOS ---

    protected $fillable = [
        'empresa_id',
        'nombre',
        'descripcion',
        'activo'
    ];
       
    // --- RELACIONES ---

    public function permisos()
    {
        return $this->hasMany(Permiso::class, 'rol_id');
    }
    
}