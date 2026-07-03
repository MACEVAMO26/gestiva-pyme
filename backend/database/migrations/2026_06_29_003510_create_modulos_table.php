<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('modulos', function (Blueprint $table) {
            $table->string('id')->primary(); // Ej: 'v_pos', 's_age'
            $table->string('nombre');
            $table->string('paquete'); // Ej: 'ventas', 'servicios', 'finanzas'
            $table->boolean('activo')->default(true); // Control global (por si quieres apagarlo para todos)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modulos');
    }
};
