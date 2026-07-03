<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Turno extends Model
{
    use HasFactory;

    // Tabla

    protected $table = 'turnos';

    // Campos

    protected $fillable = [
        'nombre_turno',
        'hora_entrada',
        'hora_salida',
        'dias_semana', // Ejemplo: "Lunes,Martes,Miércoles"
        'activo',
        'inactive_at'
    ];

      // Relaciones
      
    public function asignaciones()
    {
        return $this->hasMany(AsignacionTurno::class, 'turno_id');
    }
}