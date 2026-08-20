import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  private http = inject(HttpClient);

  currentTab: string = 'pendientes';

  // Data arrays
  areas: any[] = [];
  cargos: any[] = [];
  roles: any[] = [];
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
  categoriaDocumento: string = 'Otros';
  archivoSeleccionado: any = null;
  documentosEmpleado: any[] = [];

  categoriasDocumento: string[] = ['Hoja de Vida', 'Contrato', 'Cédula', 'Seguridad Social', 'Estudios', 'Certificaciones', 'Otros'];

  // Configuración
  configuracionRRHH: any = { arl: '', caja_compensacion: '' };

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarVacaciones();
    this.cargarAreas();
    this.cargarCargos();
    this.cargarRoles();
    this.cargarConfiguracion();
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
  exportarExcel() {
    this.toast.success('Generando archivo Excel...');
    const headers = { 'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}` };
    this.http.get('/api/export/empleados', { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `empleados_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('Excel de empleados descargado');
      },
      error: () => this.toast.error('Error al exportar. Intenta nuevamente.')
    });
  }
  abrirModuloTiempo() {}

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
    formData.append('categoria', this.categoriaDocumento || 'Otros');
    this.empleadoService.uploadDocumento(this.empleadoExpandido.id, formData).pipe(timeout(15000)).subscribe({
      next: () => {
        this.isUploading = false;
        this.archivoSeleccionado = null;
        this.nombreDocumento = '';
        this.categoriaDocumento = 'Otros';
        this.toast.success('Documento subido');
        this.cargarDocumentos(this.empleadoExpandido!.id);
      },
      error: () => {
        this.isUploading = false;
        this.toast.error('Error al subir el documento');
      }
    });
  }

  // --- EXPEDIENTE DIGITAL POR CATEGORÍAS ---
  get categoriasConDocumentos(): { categoria: string, docs: any[] }[] {
    const grupos: { [cat: string]: any[] } = {};
    this.documentosEmpleado.forEach((d) => {
      const cat = d.categoria || 'Otros';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(d);
    });
    const orden = this.categoriasDocumento;
    return Object.keys(grupos)
      .sort((a, b) => {
        const ia = orden.indexOf(a);
        const ib = orden.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .map((cat) => ({ categoria: cat, docs: grupos[cat] }));
  }

  abrirDocumento(doc: any) {
    if (doc.cloudinary_url) {
      window.open(doc.cloudinary_url, '_blank');
    }
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

  // --- CONTRATOS Y ALERTAS ---
  get todosEmpleados(): any[] {
    return [...this.empleadosActivos, ...this.empleadosInactivos];
  }

  get alertasContratos(): number {
    return this.todosEmpleados.filter(e => ['por_vencer', 'vencido'].includes(this.estadoContrato(e))).length;
  }

  estadoContrato(emp: any): string {
    if (!emp) return 'sin_fin';
    const tipo = (emp.tipo_contrato || '').toLowerCase();
    if (tipo.includes('indefinido')) return 'indefinido';
    if (!emp.fecha_fin_contrato) return 'sin_fin';
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const fin = new Date(emp.fecha_fin_contrato + 'T00:00:00');
    const diffDias = Math.ceil((fin.getTime() - hoy.getTime()) / 86400000);
    if (diffDias < 0) return 'vencido';
    if (diffDias <= 30) return 'por_vencer';
    return 'vigente';
  }

  diasParaVencimiento(emp: any): number {
    if (!emp?.fecha_fin_contrato) return 0;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const fin = new Date(emp.fecha_fin_contrato + 'T00:00:00');
    return Math.ceil((fin.getTime() - hoy.getTime()) / 86400000);
  }

  etiquetaContrato(emp: any): string {
    const st = this.estadoContrato(emp);
    const mapa: any = {
      indefinido: 'Indefinido',
      sin_fin: 'Sin fecha fin',
      vigente: 'Vigente',
      por_vencer: `Vence en ${this.diasParaVencimiento(emp)} día(s)`,
      vencido: 'Vencido'
    };
    return mapa[st];
  }

  claseContrato(emp: any): string {
    const mapa: any = {
      indefinido: 'badge-indefinido',
      sin_fin: 'badge-sinfin',
      vigente: 'badge-vigente',
      por_vencer: 'badge-porvencer',
      vencido: 'badge-vencido'
    };
    return mapa[this.estadoContrato(emp)] || '';
  }

  nombreCompletoUsuario(u: any): string {
    if (!u) return '—';
    return [u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido].filter(Boolean).join(' ');
  }

  // --- MODAL EDITAR CONTRATO ---
  isContratoModalOpen: boolean = false;
  contratoForm: any = {};
  empleadoContrato: any = null;

  abrirModalContrato(emp: any) {
    this.empleadoContrato = emp;
    this.contratoForm = {
      tipo_contrato: emp.tipo_contrato || '',
      fecha_contratacion: emp.fecha_contratacion || '',
      fecha_fin_contrato: emp.fecha_fin_contrato || '',
      salario: emp.salario ?? null
    };
    this.isContratoModalOpen = true;
  }
  cerrarModalContrato() {
    this.isContratoModalOpen = false;
  }
  guardarContrato() {
    if (!this.contratoForm.tipo_contrato || !this.contratoForm.fecha_contratacion) {
      this.toast.warning('El tipo de contrato y la fecha de contratación son obligatorios');
      return;
    }
    if (!this.empleadoContrato?.id) return;
    this.isSubmitting = true;
    this.empleadoService.updateContrato(this.empleadoContrato.id, {
      tipo_contrato: this.contratoForm.tipo_contrato,
      fecha_contratacion: this.contratoForm.fecha_contratacion,
      fecha_fin_contrato: this.contratoForm.fecha_fin_contrato || null,
      salario: this.contratoForm.salario
    }).pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.cerrarModalContrato();
        this.toast.success(res.message || 'Contrato actualizado');
        this.cargarEmpleados();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err.error?.error || 'Error al actualizar el contrato');
      }
    });
  }

  // --- CERTIFICADO LABORAL ---
  descargarCertificado(emp: any) {
    if (!emp?.id) return;
    this.empleadoService.descargarCertificado(emp.id).pipe(timeout(20000)).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado_laboral_${emp.codigo_empleado || emp.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toast.error('No se pudo generar el certificado');
      }
    });
  }
}