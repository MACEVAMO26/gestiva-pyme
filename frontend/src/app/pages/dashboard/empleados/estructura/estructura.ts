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

  // --- VARIABLES DE ESTADO ---
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

  // Al iniciar el componente
  ngOnInit() {
    this.cargarDatos();
  }

  // Para cargar los datos iniciales
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

  // Para cambiar de pestaña
  setTab(tab: string) {
    this.currentTab = tab;
  }

  // --- ÁREAS ---
  // Para abrir modal de área
  abrirModalArea(area: any = null) {
    if (area) {
      this.areaForm = { ...area };
    } else {
      this.areaForm = { id: null, nombre: '', descripcion: '' };
    }
    this.isAreaModalOpen = true;
  }

  // Para cerrar modal de área
  cerrarModalArea() {
    this.isAreaModalOpen = false;
  }

  // Para guardar área
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
  // Para abrir modal de cargo
  abrirModalCargo(cargo: any = null) {
    if (cargo) {
      this.cargoForm = { ...cargo };
    } else {
      this.cargoForm = { id: null, nombre: '', descripcion: '', rol_id: '' };
    }
    this.isCargoModalOpen = true;
  }

  // Para cerrar modal de cargo
  cerrarModalCargo() {
    this.isCargoModalOpen = false;
  }

  // Para guardar cargo
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
