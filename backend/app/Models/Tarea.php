<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tarea extends Model
{
    use HasFactory;

    protected $table = 'tareas';

    protected $fillable = [
        'titulo',
        'descripcion',
        'asignador_id',
        'asignado_id',
        'estado',
        'empresa_id',
    ];

    public function asignador()
    {
        return $this->belongsTo(User::class, 'asignador_id');
    }

    public function asignado()
    {
        return $this->belongsTo(User::class, 'asignado_id');
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}
