<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    // Sin timestamps
      
    public $timestamps = false;
 
    // Campos

    protected $fillable = [
        'empresa_id',
        'nombre',
        'descripcion',
        'activo'
    ];
       
    // Relaciones

    public function permisos()
    {
        return $this->hasMany(Permiso::class, 'rol_id');
    }
    
}