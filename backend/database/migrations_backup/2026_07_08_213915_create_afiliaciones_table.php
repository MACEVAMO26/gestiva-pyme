<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('afiliaciones', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id');
            $table->string('eps')->nullable();
            $table->string('arl')->nullable();
            $table->string('afondo_pension')->nullable();
            $table->string('estado')->default('pendiente'); // pendiente, aprobado, rechazado
            $table->string('documento_soporte_url')->nullable();
            $table->text('notas_rechazo')->nullable();
            $table->timestamps();

            // Si es un INT normal sin signo
            $table->foreign('user_id')->references('id')->on('usuarios')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('afiliaciones');
    }
};
