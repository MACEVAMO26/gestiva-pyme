<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\OrdenCompra;
use App\Models\User;

class Recepcion extends Model
{
    use HasFactory;

    // Tabla

    protected $table = 'recepciones';

    // Campos

    protected $fillable = [
        'orden_compra_id',
        'usuario_id',
        'fecha_recepcion',
        'observaciones'
    ];

    // Relaciones
    public function ordenCompra()
    {
        return $this->belongsTo(OrdenCompra::class, 'orden_compra_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    // Una recepción tiene muchos detalles (los productos recibidos)
    public function detalles()
    {
        return $this->hasMany(RecepcionDetalle::class, 'recepcion_id');
    }
}