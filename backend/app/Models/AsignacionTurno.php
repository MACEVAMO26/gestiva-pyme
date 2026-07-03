<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Importamos los modelos que vamos a relacionar
use App\Models\Turno;
use App\Models\User;

class AsignacionTurno extends Model
{
    use HasFactory;

    // Tabla
    protected $table = 'asignacion_turnos';

    // Campos
    protected $fillable = [
        'usuario_id',
        'turno_id',
        'fecha_desde',
        'fecha_hasta'
    ];

    // Relaciones
    
    public function turno()
    {
        return $this->belongsTo(Turno::class, 'turno_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}