<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    // Tabla
    
    protected $table = 'productos';

    // Timestamps
    
    public $timestamps = false;

    // Campos
    
    protected $fillable = [
        'categoria_id', 
        'empresa_id', 
        'nombre', 
        'descripcion', 
        'precio_compra', 
        'precio_venta', 
        'stock_inicial', 
        'unidad_medida', 
        'activo', 
        'fecha_inactivacion'
    ];

    // Relaciones
    
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }
}