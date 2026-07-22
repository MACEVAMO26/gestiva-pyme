<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jerarquia extends Model
{
    use HasFactory;

    protected $fillable = ['empresa_id', 'nombre', 'nivel'];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function empleados()
    {
        return $this->hasMany(Empleado::class);
    }
}
