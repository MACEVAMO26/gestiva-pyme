<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModuloSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modulos = [
            // Ventas
            ['id' => 'v_pos', 'nombre' => 'Interfaz de Venta Rápida (POS)', 'paquete' => 'ventas'],
            ['id' => 'v_inv', 'nombre' => 'Inventario y Alertas', 'paquete' => 'ventas'],
            ['id' => 'v_cxc', 'nombre' => 'Cuentas por Cobrar (Cartera)', 'paquete' => 'ventas'],
            ['id' => 'v_rep', 'nombre' => 'Reportes de Ventas', 'paquete' => 'ventas'],
            
            // Servicios
            ['id' => 's_age', 'nombre' => 'Agenda y Calendario', 'paquete' => 'servicios'],
            ['id' => 's_crm', 'nombre' => 'CRM (Gestión de Clientes)', 'paquete' => 'servicios'],
            ['id' => 's_cat', 'nombre' => 'Catálogo de Servicios', 'paquete' => 'servicios'],
            
            // Finanzas / Caja (Transversal)
            ['id' => 'f_caja', 'nombre' => 'Caja y Pre-facturación', 'paquete' => 'finanzas'],
            
            // RRHH (Transversal)
            ['id' => 'r_tur', 'nombre' => 'Horarios y Turnos', 'paquete' => 'rrhh'],
            ['id' => 'r_aus', 'nombre' => 'Control de Horas Extras y Ausencias', 'paquete' => 'rrhh'],
            ['id' => 'r_vac', 'nombre' => 'Gestión de Vacaciones', 'paquete' => 'rrhh'],
            
            // Add-ons
            ['id' => 'a_helisa', 'nombre' => 'Conector Contable (Helisa)', 'paquete' => 'addons'],
        ];

        foreach ($modulos as $mod) {
            \App\Models\Modulo::updateOrCreate(
                ['id' => $mod['id']],
                [
                    'nombre' => $mod['nombre'],
                    'paquete' => $mod['paquete'],
                    'activo' => true
                ]
            );
        }
    }
}
