import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminEstructura } from '../../base/administracion/admin-estructura/admin-estructura';

@Component({
  selector: 'app-gestion-humana',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminEstructura],
  templateUrl: './gestion-humana.component.html',
  styleUrl: './gestion-humana.component.scss'
})
export class GestionHumanaComponent implements OnInit {
  currentTab: string = 'pendientes';
  
  // Data arrays
  areas: any[] = [];
  cargos: any[] = [];
  roles: any[] = [];
  pendientes: any[] = [];
  vacacionesPendientes: any[] = [];
  empleadosActivos: any[] = [];
  empleadosInactivos: any[] = [];
  empleadosAusentes: any[] = [];
  
  // UI States
  isSubmitting: boolean = false;
  isUploading: boolean = false;
  isConfigSubmitting: boolean = false;
  
  // Modals
  isAreaModalOpen: boolean = false;
  areaForm: any = {};
  
  isCargoModalOpen: boolean = false;
  cargoForm: any = {};
  
  isFormalizarModalOpen: boolean = false;
  formalizarForm: any = {};
  usuarioAFormalizar: any = null;
  
  isBajaModalOpen: boolean = false;
  empleadoABaja: any = null;
  showConfirmDialog: boolean = true;
  motivoBaja: string = '';
  
  isVacacionesModalOpen: boolean = false;
  vacacionSeleccionada: any = null;
  justificacionVacacion: string = '';
  
  // Detalle empleado
  empleadoExpandido: any = null;
  nombreDocumento: string = '';
  archivoSeleccionado: any = null;
  documentosEmpleado: any[] = [];

  // Configuración
  configuracionRRHH: any = { arl: '', caja_compensacion: '' };

  ngOnInit(): void {
    // Inicializar datos mock
    this.pendientes = [
      { id: 1, documento: '10203040', nombres: 'Carlos', apellidos: 'Pérez', email: 'carlos@mail.com', created_at: new Date() }
    ];
    this.vacacionesPendientes = [
      { id: 1, usuario: { nombres: 'Ana', apellidos: 'Gómez' }, fecha_inicio: new Date(), fecha_fin: new Date(), tipo: 'Vacaciones', observaciones: '' }
    ];
    this.empleadosActivos = [
      { id: 1, codigo_empleado: 'EMP-001', usuario: { documento: '112233', nombres: 'Luis', apellidos: 'Martínez' }, area: { nombre: 'Sistemas' }, cargo: { nombre: 'Desarrollador' }, baja_solicitada: false }
    ];
    this.areas = [{ id: 1, nombre: 'Sistemas', descripcion: 'Área de TI' }];
    this.cargos = [{ id: 1, nombre: 'Desarrollador', rol: { nombre: 'Admin' } }];
    this.roles = [{ id: 1, nombre: 'Admin' }, { id: 2, nombre: 'Vendedor' }];
  }

  setTab(tab: string) {
    this.currentTab = tab;
  }

  // --- Areas ---
  abrirModalArea(area?: any) {
    this.areaForm = area ? { ...area } : { nombre: '', descripcion: '' };
    this.isAreaModalOpen = true;
  }
  cerrarModalArea() {
    this.isAreaModalOpen = false;
  }
  guardarArea() {
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.cerrarModalArea();
    }, 500);
  }

  // --- Cargos ---
  abrirModalCargo(cargo?: any) {
    this.cargoForm = cargo ? { ...cargo } : { nombre: '', rol_id: '', descripcion: '' };
    this.isCargoModalOpen = true;
  }
  cerrarModalCargo() {
    this.isCargoModalOpen = false;
  }
  guardarCargo() {
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.cerrarModalCargo();
    }, 500);
  }

  // --- Header Actions ---
  exportarExcel() {}
  abrirModuloTiempo() {}

  // --- Formalizar ---
  abrirModalFormalizar(p: any) {
    this.usuarioAFormalizar = p;
    this.formalizarForm = { area_id: '', cargo_id: '', tipo_contrato: '', fecha_contratacion: '', salario: null };
    this.isFormalizarModalOpen = true;
  }
  cerrarModalFormalizar() {
    this.isFormalizarModalOpen = false;
  }
  submitFormalizar() {
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.cerrarModalFormalizar();
    }, 500);
  }

  // --- Empleados Activos ---
  verDetalles(emp: any) {
    if (this.empleadoExpandido?.id === emp.id) {
      this.empleadoExpandido = null;
    } else {
      this.empleadoExpandido = emp;
      this.documentosEmpleado = [
        { id: 1, tipo_archivo: 'pdf', nombre: 'Contrato.pdf', created_at: new Date(), cloudinary_url: '#' }
      ];
    }
  }
  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }
  subirDocumento() {
    this.isUploading = true;
    setTimeout(() => {
      this.isUploading = false;
      this.archivoSeleccionado = null;
      this.nombreDocumento = '';
    }, 500);
  }
  eliminarDocumento(id: number) {}

  // --- Baja ---
  abrirModalBaja(emp: any) {
    this.empleadoABaja = emp;
    this.motivoBaja = '';
    this.showConfirmDialog = true;
    this.isBajaModalOpen = true;
  }
  cerrarModalBaja() {
    this.isBajaModalOpen = false;
  }
  submitBaja() {
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.cerrarModalBaja();
    }, 500);
  }

  // --- Vacaciones ---
  abrirModalVacaciones(vac: any) {
    this.vacacionSeleccionada = vac;
    this.justificacionVacacion = '';
    this.isVacacionesModalOpen = true;
  }
  cerrarModalVacaciones() {
    this.isVacacionesModalOpen = false;
  }
  responderVacacion(estado: string) {
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.cerrarModalVacaciones();
    }, 500);
  }

  // --- Configuracion ---
  guardarConfiguracionRRHH() {
    this.isConfigSubmitting = true;
    setTimeout(() => {
      this.isConfigSubmitting = false;
    }, 500);
  }
}
