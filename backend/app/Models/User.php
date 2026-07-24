<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // --- TABLA ---
    
    protected $table = 'usuarios';

    
    // --- TIMESTAMPS ---
    
    public $timestamps = false;

    
    // --- CAMPOS ---
    
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

    
    // --- OCULTOS ---
    
    protected $hidden = [
        'password_hash',
    ];


    // --- RELACIONES ---
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    public function cargo()
    {
        return $this->belongsTo(Cargo::class, 'cargo_id');
    }

    public function rol()
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function empleado()
    {
        return $this->hasOne(Empleado::class, 'usuario_id');
    }
}