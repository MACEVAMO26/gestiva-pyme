<?php
$e = App\Models\Empresa::where('razon_social', 'like', '%TechVenta%')->first();
if ($e) {
    echo "Tipo Empresa: " . $e->tipo_empresa . "\n";
    echo "Plan Suscripcion: " . $e->plan_suscripcion . "\n";
    echo "Monto Mensual: " . $e->monto_mensual . "\n";
}
