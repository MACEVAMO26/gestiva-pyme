import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../../services/empleado.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.scss',
})
export class EmpleadosComponent implements OnInit {

  empleadoService = inject(EmpleadoService);

  pendientes: any[] = [];
  empleados: any[] = [];
  cargos: any[] = [];
  areas: any[] = [];
  roles: any[] = []; // (por si hay que asignar un rol de acceso, aunque la tabla empleado no tiene rol directamente, el usuario sí)
  
  // UI State
  currentTab = 'pendientes'; // 'pendientes' | 'activos'
  isFormalizarModalOpen = false;
  isSubmitting = false;

  // Selected for formalization
  usuarioAFormalizar: any = null;
  formalizarForm: any = {
    area_id: '',
    cargo_id: '',
    tipo_contrato: '',
    fecha_contratacion: '',
    salario: null,
    eps: '',
    arl: '',
    fondo_pension: '',
    fondo_cesantias: '',
    caja_compensacion: ''
  };

  ngOnInit(): void {
    this.loadListas();
    this.cargarDatosTab();
  }

  loadListas() {
    this.empleadoService.getCargos().subscribe({ next: (data) => this.cargos = data });
    this.empleadoService.getAreas().subscribe({ next: (data) => this.areas = data });
    this.empleadoService.getRoles().subscribe({ next: (data) => this.roles = data });
  }

  cargarDatosTab() {
    if (this.currentTab === 'pendientes') {
      this.empleadoService.getPendientes().subscribe({
        next: (data) => this.pendientes = data,
        error: (err) => console.error(err)
      });
    } else {
      this.empleadoService.getEmpleados().subscribe({
        next: (data) => this.empleados = data,
        error: (err) => console.error(err)
      });
    }
  }

  setTab(tab: string) {
    this.currentTab = tab;
    this.cargarDatosTab();
  }

  // --- FORMALIZAR USUARIO ---
  abrirModalFormalizar(usuario: any) {
    this.usuarioAFormalizar = usuario;
    this.formalizarForm = {
      area_id: '',
      cargo_id: '',
      tipo_contrato: '',
      fecha_contratacion: new Date().toISOString().split('T')[0], // hoy
      salario: null,
      eps: '',
      arl: '',
      fondo_pension: '',
      fondo_cesantias: '',
      caja_compensacion: ''
    };
    this.isFormalizarModalOpen = true;
  }

  cerrarModalFormalizar() {
    this.isFormalizarModalOpen = false;
    this.usuarioAFormalizar = null;
  }

  submitFormalizar() {
    this.isSubmitting = true;
    this.empleadoService.formalizarEmpleado(this.usuarioAFormalizar.id, this.formalizarForm)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          alert(res.message);
          this.cerrarModalFormalizar();
          this.cargarDatosTab(); // Recargamos para que desaparezca de pendientes
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error(err);
          alert('Error al formalizar: Revisa los datos.');
        }
      });
  }

  // --- GESTION ACTIVOS ---
  verDetalles(empleado: any) {
    // Para ver o editar datos de un empleado activo (Fase 4 o utilidades extra)
    alert('Función de ver/editar empleado en construcción.');
  }
}
