<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Vacacion extends Model
{
    use HasFactory;

    // Tabla

    protected $table = 'vacaciones';

    // Campos
    
    protected $fillable = [
        'usuario_id',
        'fecha_inicio',
        'fecha_fin',
        'tipo', // 'Disfrute Legal', 'Colectivas', 'Anticipadas'
        'observaciones',
        'estado', // 'pendiente', 'aprobada', 'rechazada'
        'justificacion_respuesta'
    ];

    
    // Relaciones
    
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}