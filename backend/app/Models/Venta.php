<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $fillable = [
        'total',
        'metodo_pago',
        'estado',
        'estado_paquete',
        'vendedor_id',
        'empresa_id'
    ];
}
