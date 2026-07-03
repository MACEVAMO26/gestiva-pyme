<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // Tabla
    
    protected $table = 'usuarios';

    
    // Timestamps
    
    public $timestamps = false;

    
    // Campos
    
    protected $fillable = [
        'empresa_id',
        'cargo_id',
        'rol_id',
        'nombres',
        'apellidos',
        'documento',
        'email',
        'password_hash',
        'activo',
        'telegram_chat_id',
    ];

    
    // Ocultos
    
    protected $hidden = [
        'password_hash',
    ];


    // Relaciones
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }
}