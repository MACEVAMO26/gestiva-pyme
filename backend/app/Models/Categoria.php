<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    // Tabla
    protected $table = 'categorias';

    // Timestamps
    public $timestamps = false;

    // Campos
    protected $fillable = [
        'empresa_id', 
        'nombre', 
        'descripcion', 
        'tipo', 
        'activo', 
        'fecha_inactivacion'
    ];

    // Relaciones
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function productos()
    {
        return $this->hasMany(Producto::class, 'categoria_id');
    }
}
