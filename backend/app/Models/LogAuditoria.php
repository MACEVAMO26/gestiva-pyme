<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class LogAuditoria extends Model
{
    use HasFactory;

    // --- TABLA ---
    protected $table = 'logs_auditoria';

    
    // --- CAMPOS ---
    
        protected $fillable = [
        'usuario_id',
        'accion',
        'entidad_afectada',
        'entidad_id',
        'detalles'
    ];

    // --- CASTS ---
    
    protected $casts = [
        'detalles' => 'array',
    ];

    // --- RELACIONES ---
    
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}