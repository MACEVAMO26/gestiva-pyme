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
        Schema::table('empresa', function (Blueprint $table) {
            $table->string('plan_suscripcion')->nullable()->default('Básico');
            $table->decimal('monto_mensual', 10, 2)->default(0);
            $table->date('fecha_proximo_pago')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresa', function (Blueprint $table) {
            $table->dropColumn(['plan_suscripcion', 'monto_mensual', 'fecha_proximo_pago']);
        });
    }
};
