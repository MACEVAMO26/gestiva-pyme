import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EmpleadoService } from '../../../services/empleado.service';
import { AuthService } from '../../../services/auth.service';
import { TiempoService } from '../../../services/tiempo.service';
import { EstructuraComponent } from './estructura/estructura';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, EstructuraComponent],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.scss',
})
export class EmpleadosComponent implements OnInit {

  empleadoService = inject(EmpleadoService);
  authService = inject(AuthService);
  tiempoService = inject(TiempoService);
  private http = inject(HttpClient);
  private router = inject(Router);

  // --- VARIABLES DE ESTADO ---
  pendientes: any[] = [];
  empleados: any[] = [];
  cargos: any[] = [];
  areas: any[] = [];
  roles: any[] = []; // (por si hay que asignar un rol de acceso, aunque la tabla empleado no tiene rol directamente, el usuario sí)
  
  // UI State
  currentTab = 'pendientes'; // 'pendientes' | 'activos'
  isFormalizarModalOpen = false;
  isBajaModalOpen = false;
  isSubmitting = false;
  showConfirmDialog = false;

  empleadoABaja: any = null;
  motivoBaja = '';

  // Selected for formalization
  usuarioAFormalizar: any = null;
  formalizarForm: any = {
    area_id: '',
    cargo_id: '',
    tipo_contrato: '',
    fecha_contratacion: '',
    salario: null
  };

  // Configuración RRHH
  configuracionRRHH = {
    arl: '',
    caja_compensacion: ''
  };
  isConfigSubmitting = false;

  ngOnInit(): void {
    this.loadListas();
    this.cargarDatosTab();
  }

  // Para cargar listas de datos
  loadListas() {
    this.empleadoService.getCargos().subscribe({ next: (data) => this.cargos = data });
    this.empleadoService.getAreas().subscribe({ next: (data) => this.areas = data });
    this.empleadoService.getRoles().subscribe({ next: (data) => this.roles = data });
  }

  // Filtered lists
  empleadosActivos: any[] = [];
  empleadosInactivos: any[] = [];
  empleadosAusentes: any[] = [];

  // Vacaciones
  vacacionesPendientes: any[] = [];
  isVacacionesModalOpen = false;
  vacacionSeleccionada: any = null;
  justificacionVacacion = '';

  // Para cargar datos según la pestaña activa
  cargarDatosTab() {
    if (this.currentTab === 'pendientes') {
      this.empleadoService.getPendientes().subscribe({
        next: (data) => this.pendientes = data,
        error: (err) => console.error(err)
      });
      this.tiempoService.getVacaciones().subscribe({
        next: (data) => {
          this.vacacionesPendientes = data.filter((v: any) => v.estado === 'pendiente');
        },
        error: (err) => console.error(err)
      });
    } else if (this.currentTab === 'configuracion') {
      const u = this.authService.getUser();
      if (u && u.empresa) {
        this.configuracionRRHH.arl = u.empresa.arl || '';
        this.configuracionRRHH.caja_compensacion = u.empresa.caja_compensacion || '';
      }
    } else if (this.currentTab !== 'estructura') {
      this.empleadoService.getEmpleados().subscribe({
        next: (data) => {
          this.empleados = data;
          this.empleadosActivos = this.empleados.filter((e: any) => e.estado === 'activo');
          this.empleadosInactivos = this.empleados.filter((e: any) => e.estado === 'inactivo');
          this.empleadosAusentes = this.empleados.filter((e: any) => ['vacaciones', 'permiso', 'incapacitado'].includes(e.estado));
        },
        error: (err) => console.error(err)
      });
    }
  }

  // Para cambiar de pestaña
  setTab(tab: string) {
    this.currentTab = tab;
    this.cargarDatosTab();
  }

  // Para guardar configuración de RRHH
  guardarConfiguracionRRHH() {
    this.isConfigSubmitting = true;
    this.empleadoService.updateRRHHSettings(this.configuracionRRHH).subscribe({
      next: (res) => {
        this.isConfigSubmitting = false;
        alert('Configuración actualizada correctamente');
        // Actualizamos el usuario en sesión (local) para reflejar cambios
        const u = this.authService.getUser();
        if (u) {
          u.empresa = res.empresa;
          localStorage.setItem('user', JSON.stringify(u));
        }
      },
      error: (err) => {
        this.isConfigSubmitting = false;
        console.error(err);
        alert('Error al guardar configuración');
      }
    });
  }

  // --- FORMALIZAR USUARIO ---
  // Para abrir modal de formalizar
  abrirModalFormalizar(usuario: any) {
    this.usuarioAFormalizar = usuario;
    this.formalizarForm = {
      area_id: '',
      cargo_id: '',
      tipo_contrato: '',
      fecha_contratacion: new Date().toISOString().split('T')[0], // hoy
      salario: null
    };
    this.isFormalizarModalOpen = true;
  }

  // Para cerrar modal de formalizar
  cerrarModalFormalizar() {
    this.isFormalizarModalOpen = false;
    this.usuarioAFormalizar = null;
  }

  // Para formalizar empleado
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
  empleadoExpandido: any = null;
  documentosEmpleado: any[] = [];
  archivoSeleccionado: File | null = null;
  nombreDocumento: string = '';
  isUploading = false;

  // Para ver detalles de un empleado
  verDetalles(empleado: any) {
    if (this.empleadoExpandido?.id === empleado.id) {
      this.empleadoExpandido = null; // Toggle collapse
      this.documentosEmpleado = [];
    } else {
      this.empleadoExpandido = empleado;
      this.cargarDocumentos(empleado.id);
    }
  }

  // Para cargar documentos del empleado
  cargarDocumentos(empleadoId: number) {
    this.empleadoService.getDocumentos(empleadoId).subscribe({
      next: (docs) => this.documentosEmpleado = docs,
      error: (err) => console.error('Error cargando documentos', err)
    });
  }

  // Para manejar la selección de archivos
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const permitidos = ['pdf', 'ppt', 'pptx'];
      if (!permitidos.includes(extension || '')) {
        alert('Formato no permitido. Solo PDF y PowerPoint.');
        this.archivoSeleccionado = null;
        event.target.value = ''; // clear input
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo supera el límite de 10MB.');
        this.archivoSeleccionado = null;
        event.target.value = '';
        return;
      }
      this.archivoSeleccionado = file;
    }
  }

  // Para subir documento
  subirDocumento() {
    if (!this.archivoSeleccionado || !this.nombreDocumento || !this.empleadoExpandido) return;
    
    this.isUploading = true;
    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('nombre', this.nombreDocumento);

    this.empleadoService.uploadDocumento(this.empleadoExpandido.id, formData).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.archivoSeleccionado = null;
        this.nombreDocumento = '';
        // @ts-ignore
        document.getElementById('fileInputDoc').value = '';
        this.cargarDocumentos(this.empleadoExpandido.id);
      },
      error: (err) => {
        this.isUploading = false;
        alert('Error al subir documento.');
        console.error(err);
      }
    });
  }

  // Para eliminar documento
  eliminarDocumento(id: number) {
    if(!confirm('¿Estás seguro de eliminar este documento?')) return;
    this.empleadoService.deleteDocumento(id).subscribe({
      next: () => {
        this.cargarDocumentos(this.empleadoExpandido.id);
      },
      error: (err) => console.error('Error eliminando documento', err)
    });
  }

  // --- SOLICITUD DE BAJA ---
  // Para abrir modal de baja
  abrirModalBaja(empleado: any) {
    if (empleado.baja_solicitada) {
      alert('Ya existe una solicitud de baja en proceso para este empleado.');
      return;
    }
    this.empleadoABaja = empleado;
    this.motivoBaja = '';
    this.isBajaModalOpen = true;
  }

  // Para cerrar modal de baja
  cerrarModalBaja() {
    this.isBajaModalOpen = false;
    this.empleadoABaja = null;
    this.motivoBaja = '';
  }

  // Para solicitar baja
  submitBaja() {
    if (!this.motivoBaja.trim()) {
      alert('Debe ingresar un motivo para la baja.');
      return;
    }

    this.isSubmitting = true;
    this.empleadoService.solicitarBaja(this.empleadoABaja.id, this.motivoBaja)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          alert(res.message);
          this.cerrarModalBaja();
          this.cargarDatosTab();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error(err);
          alert('Error al solicitar la baja: ' + (err.error?.error || err.message));
        }
      });
  }

  // Para ir a módulo de tiempos
  irATiempos() {
    const user = this.authService.getUser();
    const entorno = user?.empresa?.slug || user?.empresa?.nombre_url || 'demo';
    this.router.navigate(['/', entorno, 'tiempo']);
  }

  // Redirige al modulo de tiempo 
  abrirModuloTiempo() {
    this.irATiempos();
  }

  // Para exportar a Excel
  exportarExcel() {
    this.http.get('/api/export/empleados', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `empleados_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar:', err);
        alert('Hubo un error al exportar el archivo.');
      }
    });
  }

  // --- VACACIONES ---
  // Para abrir modal de vacaciones
  abrirModalVacaciones(vacacion: any) {
    this.vacacionSeleccionada = vacacion;
    this.justificacionVacacion = '';
    this.isVacacionesModalOpen = true;
  }

  // Para cerrar modal de vacaciones
  cerrarModalVacaciones() {
    this.isVacacionesModalOpen = false;
    this.vacacionSeleccionada = null;
  }

  // Para responder solicitud de vacaciones
  responderVacacion(estado: string) {
    if (estado === 'rechazada' && !this.justificacionVacacion.trim()) {
      alert('Debe justificar el rechazo.');
      return;
    }
    
    this.isSubmitting = true;
    const payload = {
      estado,
      justificacion_respuesta: this.justificacionVacacion
    };
    
    this.tiempoService.responderVacaciones(this.vacacionSeleccionada.id, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        alert(res.message);
        this.cerrarModalVacaciones();
        this.cargarDatosTab();
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        alert('Error al procesar solicitud de vacaciones.');
      }
    });
  }
}
