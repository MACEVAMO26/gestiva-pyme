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
        if (!Schema::hasTable('admin_requests')) { Schema::create('admin_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empresa_id')->nullable();
            $table->string('tipo'); // 'pago' o 'migracion'
            $table->string('estado')->default('pendiente');
            $table->text('notas_propietaria')->nullable();
            $table->string('banco')->nullable();
            $table->timestamps();
    }); }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_requests');
    }
};
