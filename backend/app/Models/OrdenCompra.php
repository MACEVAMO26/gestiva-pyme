<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\OrdenCompraDetalle;

class OrdenCompra extends Model
{
    use HasFactory;

    // Tabla

    protected $table = 'ordenes_compra';

    // Timestamps
    public $timestamps = false;

    // Campos

    protected $fillable = [
        'proveedor_id',
        'usuario_id',
        'fecha_requerida',
        'estado',
        'justificacion_rechazo',
        'motivo_anulacion',
        'total',
    ];

    // Relaciones
    
    public function detalles()
    {
        return $this->hasMany(OrdenCompraDetalle::class, 'orden_compra_id');
    }
}