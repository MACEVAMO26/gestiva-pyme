<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Producto; 

class Inventario extends Model
{
    use HasFactory;

    // --- TABLA ---
    
    protected $table = 'inventario';

    // --- CAMPOS ---
    
    protected $fillable = [
        'producto_id',
        'cantidad_disponible',
        'cantidad_reservada',
        'ubicacion',
        'lote',
        'fecha_vencimiento'
    ];

        
    // --- RELACIONES ---
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }
}