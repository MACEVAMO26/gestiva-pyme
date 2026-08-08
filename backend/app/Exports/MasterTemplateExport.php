<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class MasterTemplateExport implements WithMultipleSheets
{
    use Exportable;

    protected $empresaId;
    protected $isTemplate;

    public function __construct($empresaId = null, $isTemplate = false)
    {
        $this->empresaId = $empresaId;
        $this->isTemplate = $isTemplate;
    }

    public function sheets(): array
    {
        return [
            new ClientesExportSheet($this->empresaId, $this->isTemplate),
            new ProveedoresExportSheet($this->empresaId, $this->isTemplate),
            new ProductosExportSheet($this->empresaId, $this->isTemplate),
            new ServiciosExportSheet($this->empresaId, $this->isTemplate),
            new EmpleadosExportSheet($this->empresaId, $this->isTemplate),
        ];
    }
}
