import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiempoService } from '../../../../../services/tiempo.service';
import { EmpleadoService } from '../../../../../services/empleado.service';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-autogestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autogestion.component.html',
  styleUrl: './autogestion.component.scss'
})
export class AutogestionComponent implements OnInit {
  private tiempoService = inject(TiempoService);
  private empleadoService = inject(EmpleadoService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  usuarioActual: any;
  user: any; // Mapeado del auth service
  pestanaActual = 'vacaciones'; // 'vacaciones' | 'turnos' | 'documentos'
  
  // Perfil / Avatar
  profileImageUrl: string | null = null;
  isUploadingAvatar = false;

  // Afiliaciones
  afiliacion: any = {};
  formAfiliacion: any = { estado: 'nuevo' };
  isHR = false;
  isSaving = false;
  isSavingAdmin = false;
  cantidadRenovaciones = 0;

  // Vacaciones
  misVacaciones: any[] = [];
  nuevaVacacion = {
    fecha_inicio: '',
    fecha_fin: '',
    tipo: 'Disfrute Legal',
    observaciones: ''
  };
  isSubmittingVacacion = false;
  diasDisponibles = 15; // Por defecto o calculado desde el backend

  // Documentos
  misDocumentos: any[] = [];
  archivoSeleccionado: File | null = null;
  nombreArchivo = '';

  // Turnos
  misTurnos: any[] = [];

  cargando = false;
  guardando = false;

  ngOnInit() {
    this.usuarioActual = this.authService.getUser();
    this.user = this.usuarioActual;
    
    // Si el usuario es de Recursos Humanos (Jefe de Area)
    this.isHR = this.user?.rol?.nombre === 'Jefe de Área';
    
    this.cargarVacaciones();
    this.cargarDocumentos();
    // Aquí cargarías las afiliaciones del empleado si existiera el endpoint:
    // this.cargarAfiliacion();
  }

  // --- AVATAR ---
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.isUploadingAvatar = true;
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
        this.isUploadingAvatar = false;
        this.toast.success('Foto de perfil actualizada (simulación)');
      };
      reader.readAsDataURL(file);
    }
  }

  cambiarPestana(pestana: string) {
    this.pestanaActual = pestana;
    if (pestana === 'vacaciones') this.cargarVacaciones();
    if (pestana === 'documentos') this.cargarDocumentos();
    if (pestana === 'turnos') this.cargarTurnos();
  }

  // --- AFILIACIONES ---
  guardarAfiliaciones() {
    this.isSaving = true;
    setTimeout(() => {
      this.afiliacion = { ...this.formAfiliacion, estado: 'pendiente' };
      this.formAfiliacion.estado = 'pendiente';
      this.isSaving = false;
      this.toast.success('Afiliaciones enviadas a revisión por RRHH');
    }, 1000);
  }

  gestionarAfiliacionAdmin() {
    this.isSavingAdmin = true;
    setTimeout(() => {
      this.afiliacion = { ...this.formAfiliacion };
      this.isSavingAdmin = false;
      this.toast.success('Gestión de afiliación guardada correctamente');
    }, 1000);
  }

  descargarCertificado() {
    this.toast.success('Generando certificado laboral...');
  }

  descargarContrato() {
    this.toast.success('Descargando copia del contrato...');
  }

  // --- VACACIONES ---
  cargarVacaciones() {
    if (!this.usuarioActual) return;
    this.cargando = true;
    this.tiempoService.getMisVacaciones(this.usuarioActual.id).pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.misVacaciones = res;
        this.cargando = false;
      },
      error: () => {
        this.misVacaciones = [];
        this.cargando = false;
      }
    });
  }

  solicitarVacaciones() {
    if (!this.nuevaVacacion.fecha_inicio || !this.nuevaVacacion.fecha_fin) {
      this.toast.warning('Complete las fechas');
      return;
    }
    
    this.isSubmittingVacacion = true;
    const payload = { ...this.nuevaVacacion, usuario_id: this.usuarioActual?.id };
    
    this.tiempoService.solicitarVacaciones(payload).subscribe({
      next: () => {
        this.toast.success('Solicitud enviada al administrador');
        this.isSubmittingVacacion = false;
        this.nuevaVacacion = { fecha_inicio: '', fecha_fin: '', tipo: 'Disfrute Legal', observaciones: '' };
        this.cargarVacaciones();
      },
      error: () => {
        this.toast.error('Error al enviar la solicitud');
        this.isSubmittingVacacion = false;
      }
    });
  }

  // --- DOCUMENTOS ---
  cargarDocumentos() {
    this.cargando = true;
    this.empleadoService.getMisDocumentos().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.misDocumentos = res;
        this.cargando = false;
      },
      error: () => {
        this.misDocumentos = [];
        this.cargando = false;
      }
    });
  }

  subirDocumento() {
    if (!this.archivoSeleccionado || !this.nombreArchivo || !this.usuarioActual) {
      this.toast.warning('Complete nombre y seleccione un archivo');
      return;
    }

    this.guardando = true;
    const formData = new FormData();
    formData.append('documento', this.archivoSeleccionado);
    formData.append('nombre', this.nombreArchivo);
    
    this.empleadoService.uploadDocumento(this.usuarioActual.id, formData).subscribe({
      next: () => {
        this.toast.success('Documento subido correctamente');
        this.guardando = false;
        this.nombreArchivo = '';
        this.archivoSeleccionado = null;
        this.cargarDocumentos();
      },
      error: () => {
        this.toast.error('Error al subir el documento');
        this.guardando = false;
      }
    });
  }

  eliminarDocumento(id: number) {
    if (confirm('¿Eliminar este documento?')) {
      this.empleadoService.deleteDocumento(id).subscribe({
        next: () => {
          this.toast.success('Documento eliminado');
          this.cargarDocumentos();
        },
        error: () => this.toast.error('Error al eliminar')
      });
    }
  }

  // --- TURNOS ---
  cargarTurnos() {
    this.cargando = true;
    this.tiempoService.getTurnos().subscribe({
      next: (res) => {
        this.misTurnos = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
}
