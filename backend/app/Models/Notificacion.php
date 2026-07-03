<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Notificacion extends Model
{
    use HasFactory;

    // Tabla

    protected $table = 'notificaciones';

    // Campos

    protected $fillable = [
        'usuario_id',
        'titulo',
        'mensaje',
        'leida' // Booleano: true o false
    ];

    // Relaciones
    
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}