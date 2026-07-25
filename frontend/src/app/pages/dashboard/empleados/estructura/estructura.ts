import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../../../services/empleado.service';

@Component({
  selector: 'app-estructura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estructura.html',
  styleUrl: './estructura.scss',
})
export class EstructuraComponent implements OnInit {
  
  empleadoService = inject(EmpleadoService);

  // Tabs internas: 'areas' o 'cargos'
  currentTab = 'areas';

  areas: any[] = [];
  cargos: any[] = [];
  roles: any[] = [];

  // Modales
  isAreaModalOpen = false;
  isCargoModalOpen = false;
  isSubmitting = false;

  areaForm = { id: null, nombre: '', descripcion: '' };
  cargoForm = { id: null, nombre: '', descripcion: '', rol_id: '' };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.empleadoService.getAreas().subscribe({
      next: (data) => this.areas = data
    });
    this.empleadoService.getCargos().subscribe({
      next: (data) => this.cargos = data
    });
    this.empleadoService.getRoles().subscribe({
      next: (data) => this.roles = data
    });
  }

  setTab(tab: string) {
    this.currentTab = tab;
  }

  // --- ÁREAS ---
  abrirModalArea(area: any = null) {
    if (area) {
      this.areaForm = { ...area };
    } else {
      this.areaForm = { id: null, nombre: '', descripcion: '' };
    }
    this.isAreaModalOpen = true;
  }

  cerrarModalArea() {
    this.isAreaModalOpen = false;
  }

  guardarArea() {
    this.isSubmitting = true;
    const request = this.areaForm.id 
      ? this.empleadoService.updateArea(this.areaForm.id, this.areaForm)
      : this.empleadoService.createArea(this.areaForm);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Área guardada con éxito');
        this.cerrarModalArea();
        this.cargarDatos();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Error al guardar área');
        console.error(err);
      }
    });
  }

  // --- CARGOS ---
  abrirModalCargo(cargo: any = null) {
    if (cargo) {
      this.cargoForm = { ...cargo };
    } else {
      this.cargoForm = { id: null, nombre: '', descripcion: '', rol_id: '' };
    }
    this.isCargoModalOpen = true;
  }

  cerrarModalCargo() {
    this.isCargoModalOpen = false;
  }

  guardarCargo() {
    this.isSubmitting = true;
    const request = this.cargoForm.id
      ? this.empleadoService.updateCargo(this.cargoForm.id, this.cargoForm)
      : this.empleadoService.createCargo(this.cargoForm);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Cargo guardado con éxito');
        this.cerrarModalCargo();
        this.cargarDatos();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Error al guardar cargo');
        console.error(err);
      }
    });
  }
}
