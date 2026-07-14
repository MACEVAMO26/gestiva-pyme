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
        Schema::create('empresa_modulo', function (Blueprint $table) {
            $table->id();
            $table->integer('empresa_id');
            $table->foreign('empresa_id')->references('id')->on('empresa')->onDelete('cascade');
            $table->string('modulo_id');
            $table->foreign('modulo_id')->references('id')->on('modulos')->onDelete('cascade');
            $table->boolean('activo')->default(true); // Switch por empresa
            $table->timestamps();
            
            $table->unique(['empresa_id', 'modulo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresa_modulo');
    }
};
