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
        Schema::table('afiliaciones', function (Blueprint $table) {
            $table->date('fecha_contratacion')->nullable()->after('estado');
            $table->date('finalizacion_contrato')->nullable()->after('fecha_contratacion');
            $table->date('renovacion_contrato')->nullable()->after('finalizacion_contrato');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('afiliaciones', function (Blueprint $table) {
            $table->dropColumn(['fecha_contratacion', 'finalizacion_contrato', 'renovacion_contrato']);
        });
    }
};
