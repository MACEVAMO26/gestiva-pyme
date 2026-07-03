<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class LogAuditoria extends Model
{
    use HasFactory;

    // Tabla
    protected $table = 'logs_auditoria';

    
    // Campos
    
        protected $fillable = [
        'usuario_id',
        'accion',
        'entidad_afectada',
        'entidad_id',
        'detalles'
    ];

    // Casts
    
    protected $casts = [
        'detalles' => 'array',
    ];

    // Relaciones
    
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}