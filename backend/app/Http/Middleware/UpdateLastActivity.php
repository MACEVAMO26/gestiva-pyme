<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use Illuminate\Support\Facades\Auth;
use App\Models\Empresa;

class UpdateLastActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            $now = now();
            
            // Actualizar usuario
            $user->last_activity_at = $now;
            // No actualizar timestamps (updated_at) solo por la actividad
            $user->timestamps = false;
            $user->save();
            $user->timestamps = true;

            // Actualizar empresa si pertenece a una
            if ($user->empresa_id) {
                // Update directo para ser más óptimos y no disparar eventos
                \Illuminate\Support\Facades\DB::table('empresa')
                    ->where('id', $user->empresa_id)
                    ->update(['last_activity_at' => $now]);
            }
        }

        return $next($request);
    }
}
