<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $fillable = ['empresa_id', 'nombre'];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function empleados()
    {
        return $this->hasMany(Empleado::class);
    }
}
