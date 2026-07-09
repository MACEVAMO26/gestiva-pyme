<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE empresa MODIFY tipo_empresa ENUM('Solo Servicios', 'Solo Ventas', 'Ventas y Servicios', 'Servicios', 'Ventas') NOT NULL");
        DB::statement("UPDATE empresa SET tipo_empresa = 'Servicios' WHERE tipo_empresa = 'Solo Servicios'");
        DB::statement("UPDATE empresa SET tipo_empresa = 'Ventas' WHERE tipo_empresa = 'Solo Ventas'");
        DB::statement("ALTER TABLE empresa MODIFY tipo_empresa ENUM('Servicios', 'Ventas', 'Ventas y Servicios') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE empresa MODIFY tipo_empresa ENUM('Solo Servicios', 'Solo Ventas', 'Ventas y Servicios', 'Servicios', 'Ventas') NOT NULL");
        DB::statement("UPDATE empresa SET tipo_empresa = 'Solo Servicios' WHERE tipo_empresa = 'Servicios'");
        DB::statement("UPDATE empresa SET tipo_empresa = 'Solo Ventas' WHERE tipo_empresa = 'Ventas'");
        DB::statement("ALTER TABLE empresa MODIFY tipo_empresa ENUM('Solo Servicios', 'Solo Ventas', 'Ventas y Servicios') NOT NULL");
    }
};

