import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminEstructura } from '../../base/administracion/admin-estructura/admin-estructura';
import { EmpleadoService } from '../../../../../services/empleado.service';
import { VacacionService, Vacacion } from '../../../../../services/vacacion.service';
import { ToastService } from '../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-gestion-humana',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminEstructura],
  templateUrl: './gestion-humana.component.html',
  styleUrl: './gestion-humana.component.scss'
})
export class GestionHumanaComponent implements OnInit {
  private empleadoService = inject(EmpleadoService);
  private vacacionService = inject(VacacionService);
  private toast = inject(ToastService);

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
    this.cargarPendientes();
    this.cargarEmpleados();
    this.cargarVacaciones();
    this.cargarAreas();
    this.cargarCargos();
    this.cargarRoles();
    this.cargarConfiguracion();
  }

  cargarPendientes() {
    this.empleadoService.getPendientes().pipe(timeout(8000)).subscribe({
      next: (res) => { this.pendientes = res; },
      error: () => { this.pendientes = []; }
    });
  }

  cargarEmpleados() {
    this.empleadoService.getEmpleados().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.empleadosActivos = res.filter((e: any) => e.estado === 'activo');
        this.empleadosInactivos = res.filter((e: any) => e.estado === 'inactivo');
        this.empleadosAusentes = res.filter((e: any) => e.estado && e.estado !== 'activo' && e.estado !== 'inactivo');
      },
      error: () => {
        this.empleadosActivos = [];
        this.empleadosInactivos = [];
        this.empleadosAusentes = [];
      }
    });
  }

  cargarVacaciones() {
    this.vacacionService.getVacaciones().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.vacacionesPendientes = res.filter(v => v.estado === 'pendiente');
      },
      error: () => { this.vacacionesPendientes = []; }
    });
  }

  cargarAreas() {
    this.empleadoService.getAreas().pipe(timeout(8000)).subscribe({
      next: (res) => { this.areas = res; },
      error: () => { this.areas = []; }
    });
  }

  cargarCargos() {
    this.empleadoService.getCargos().pipe(timeout(8000)).subscribe({
      next: (res) => { this.cargos = res; },
      error: () => { this.cargos = []; }
    });
  }

  cargarRoles() {
    this.empleadoService.getRoles().pipe(timeout(8000)).subscribe({
      next: (res) => { this.roles = res; },
      error: () => { this.roles = []; }
    });
  }

  cargarConfiguracion() {
    const user = JSON.parse(sessionStorage.getItem('current_user') || '{}');
    const empresaId = user?.empresa_id;
    if (!empresaId) return;
    this.empleadoService.getConfiguracion(empresaId).pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.configuracionRRHH = {
          arl: res.arl || '',
          caja_compensacion: res.caja_compensacion || ''
        };
      },
      error: () => {}
    });
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
    if (!this.areaForm.nombre) {
      this.toast.warning('El nombre del área es obligatorio');
      return;
    }
    this.isSubmitting = true;
    const obs = this.areaForm.id
      ? this.empleadoService.updateArea(this.areaForm.id, { nombre: this.areaForm.nombre, descripcion: this.areaForm.descripcion })
      : this.empleadoService.createArea({ nombre: this.areaForm.nombre, descripcion: this.areaForm.descripcion });
    obs.pipe(timeout(8000)).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cerrarModalArea();
        this.toast.success('Área guardada');
        this.cargarAreas();
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.error('Error al guardar el área');
      }
    });
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
    if (!this.cargoForm.nombre || !this.cargoForm.rol_id) {
      this.toast.warning('El nombre y el rol son obligatorios');
      return;
    }
    this.isSubmitting = true;
    const payload = {
      nombre: this.cargoForm.nombre,
      rol_id: this.cargoForm.rol_id,
      descripcion: this.cargoForm.descripcion
    };
    const obs = this.cargoForm.id
      ? this.empleadoService.updateCargo(this.cargoForm.id, payload)
      : this.empleadoService.createCargo(payload);
    obs.pipe(timeout(8000)).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cerrarModalCargo();
        this.toast.success('Cargo guardado');
        this.cargarCargos();
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.error('Error al guardar el cargo');
      }
    });
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
    if (!this.formalizarForm.area_id || !this.formalizarForm.cargo_id || !this.formalizarForm.tipo_contrato || !this.formalizarForm.fecha_contratacion) {
      this.toast.warning('Complete los datos organizacionales y laborales');
      return;
    }
    if (!this.usuarioAFormalizar?.id) return;
    this.isSubmitting = true;
    this.empleadoService.formalizarEmpleado(this.usuarioAFormalizar.id, {
      area_id: this.formalizarForm.area_id,
      cargo_id: this.formalizarForm.cargo_id,
      tipo_contrato: this.formalizarForm.tipo_contrato,
      fecha_contratacion: this.formalizarForm.fecha_contratacion,
      salario: this.formalizarForm.salario
    }).pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.cerrarModalFormalizar();
        this.toast.success(res.message || 'Empleado formalizado');
        this.cargarPendientes();
        this.cargarEmpleados();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err.error?.error || 'Error al formalizar el empleado');
      }
    });
  }

  // --- Empleados Activos ---
  verDetalles(emp: any) {
    if (this.empleadoExpandido?.id === emp.id) {
      this.empleadoExpandido = null;
    } else {
      this.empleadoExpandido = emp;
      this.cargarDocumentos(emp.id);
    }
  }

  cargarDocumentos(empleadoId: number) {
    this.empleadoService.getDocumentos(empleadoId).pipe(timeout(8000)).subscribe({
      next: (res) => { this.documentosEmpleado = res; },
      error: () => { this.documentosEmpleado = []; }
    });
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }
  subirDocumento() {
    if (!this.archivoSeleccionado || !this.empleadoExpandido?.id) {
      this.toast.warning('Seleccione un archivo');
      return;
    }
    this.isUploading = true;
    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('nombre', this.nombreDocumento || this.archivoSeleccionado.name || 'Documento');
    this.empleadoService.uploadDocumento(this.empleadoExpandido.id, formData).pipe(timeout(15000)).subscribe({
      next: () => {
        this.isUploading = false;
        this.archivoSeleccionado = null;
        this.nombreDocumento = '';
        this.toast.success('Documento subido');
        this.cargarDocumentos(this.empleadoExpandido!.id);
      },
      error: () => {
        this.isUploading = false;
        this.toast.error('Error al subir el documento');
      }
    });
  }
  eliminarDocumento(id: number) {
    this.empleadoService.deleteDocumento(id).pipe(timeout(8000)).subscribe({
      next: () => {
        this.toast.success('Documento eliminado');
        if (this.empleadoExpandido?.id) this.cargarDocumentos(this.empleadoExpandido.id);
      },
      error: () => {
        this.toast.error('Error al eliminar el documento');
      }
    });
  }

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
    if (!this.motivoBaja.trim()) {
      this.toast.warning('Describa el motivo de la baja');
      return;
    }
    if (!this.empleadoABaja?.id) return;
    this.isSubmitting = true;
    this.empleadoService.solicitarBaja(this.empleadoABaja.id, this.motivoBaja).pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.cerrarModalBaja();
        this.toast.success(res.message || 'Solicitud de baja enviada');
        this.cargarEmpleados();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err.error?.error || 'Error al solicitar la baja');
      }
    });
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
    if (!this.vacacionSeleccionada?.id) return;
    this.isSubmitting = true;
    this.vacacionService.responder(this.vacacionSeleccionada.id, estado, this.justificacionVacacion).pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.cerrarModalVacaciones();
        this.toast.success(res.message || 'Solicitud actualizada');
        this.cargarVacaciones();
        this.cargarEmpleados();
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.error('Error al responder la solicitud');
      }
    });
  }

  // --- Configuracion ---
  guardarConfiguracionRRHH() {
    const user = JSON.parse(sessionStorage.getItem('current_user') || '{}');
    const empresaId = user?.empresa_id;
    if (!empresaId) {
      this.toast.error('No se pudo identificar la empresa');
      return;
    }
    this.isConfigSubmitting = true;
    this.empleadoService.updateConfiguracion(empresaId, {
      arl: this.configuracionRRHH.arl,
      caja_compensacion: this.configuracionRRHH.caja_compensacion
    }).pipe(timeout(8000)).subscribe({
      next: () => {
        this.isConfigSubmitting = false;
        this.toast.success('Configuración guardada');
      },
      error: () => {
        this.isConfigSubmitting = false;
        this.toast.error('Error al guardar la configuración');
      }
    });
  }
}