<?php

namespace App\Exports;

use App\Models\Empleado;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;

class EmpleadosExportSheet implements FromCollection, WithHeadings, WithTitle, WithMapping
{
    protected $empresaId;
    protected $isTemplate;

    public function __construct($empresaId = null, $isTemplate = false)
    {
        $this->empresaId = $empresaId;
        $this->isTemplate = $isTemplate;
    }

    public function collection()
    {
        if ($this->isTemplate || !$this->empresaId) {
            return collect([]);
        }
        return Empleado::where("empresa_id", $this->empresaId)->with("usuario")->get();
    }

    public function headings(): array
    {
        return [
            "ID (No Modificar)",
            "Nombres Usuario",
            "Documento Usuario",
            "Email Usuario",
            "Codigo Empleado",
            "Area ID",
            "Cargo ID",
            "Fecha Contratacion",
            "Tipo Contrato",
            "Salario",
            "Estado"
        ];
    }

    public function map($empleado): array
    {
        return [
            $empleado->id,
            $empleado->usuario ? $empleado->usuario->nombres . " " . $empleado->usuario->apellidos : "",
            $empleado->usuario ? $empleado->usuario->documento : "",
            $empleado->usuario ? $empleado->usuario->email : "",
            $empleado->codigo_empleado,
            $empleado->area_id,
            $empleado->cargo_id,
            $empleado->fecha_contratacion,
            $empleado->tipo_contrato,
            $empleado->salario,
            $empleado->estado
        ];
    }

    public function title(): string
    {
        return "Empleados";
    }
}
