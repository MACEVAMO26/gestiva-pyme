<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empleado extends Model
{
    protected $fillable = [
        'codigo_empleado',
        'usuario_id',
        'empresa_id',
        'area_id',
        'cargo_id',
        'jerarquia_id',
        'fecha_contratacion',
        'tipo_contrato',
        'salario',
        'eps',
        'arl',
        'fondo_pension',
        'fondo_cesantias',
        'caja_compensacion',
        'estado'
    ];
}
