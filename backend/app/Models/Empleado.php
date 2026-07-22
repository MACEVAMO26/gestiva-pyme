<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empleado extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo_empleado', 'user_id', 'empresa_id', 'area_id', 'jerarquia_id',
        'nombres', 'apellidos', 'documento', 'cargo', 'estado',
        'eps', 'arl', 'fondo_pension', 'fondo_cesantias'
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function empresa() { return $this->belongsTo(Empresa::class, 'empresa_id'); }
    public function area() { return $this->belongsTo(Area::class); }
    public function jerarquia() { return $this->belongsTo(Jerarquia::class); }
}
