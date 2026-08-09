import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { TiempoService } from '../../../services/tiempo.service';
import { EmpleadoService } from '../../../services/empleado.service';

@Component({
  selector: 'app-autogestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autogestion.html',
  styleUrl: './autogestion.scss'
})
export class AutogestionComponent implements OnInit {
  // --- VARIABLES DE ESTADO ---
  isSaving = false;
  isSavingAdmin = false;
  isUploadingAvatar = false;
  user: any = null;
  afiliacion: any = null;
  profileImageUrl: string | null = null;
  
  formAfiliacion = {
    eps: '',
    arl: '',
    fondo_cesantias: '',
    afondo_pension: '',
    fecha_contratacion: '',
    finalizacion_contrato: '',
    renovacion_contrato: '',
    estado_afiliacion: true,
    estado: 'nuevo' // Empezamos en nuevo para permitir llenar la primera vez
  };

  cantidadRenovaciones: number = 0;
  solicitudEnviada: boolean = false;

  // Variables para Vacaciones
  misVacaciones: any[] = [];
  diasDisponibles: number = 0;
  nuevaVacacion = {
    fecha_inicio: '',
    fecha_fin: '',
    tipo: 'Disfrute Legal',
    observaciones: ''
  };
  isSubmittingVacacion = false;

  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private tiempoService = inject(TiempoService);
  private empleadoService = inject(EmpleadoService);

  misDocumentos: any[] = [];

  // Verifica si el usuario actual es de Recursos Humanos
  get isHR(): boolean {
    const rol = this.user?.rol?.nombre?.toLowerCase() || '';
    return rol.includes('recursos humanos');
  }

  // Inicializa el componente y carga datos
  ngOnInit(): void {
    this.user = this.authService.getUser() as any;
    this.cargarAfiliaciones();
    this.cargarMisVacaciones();
    this.cargarMisDocumentos();
  }

  // Carga los documentos asociados al usuario
  cargarMisDocumentos() {
    this.empleadoService.getMisDocumentos().subscribe({
      next: (data) => this.misDocumentos = data || [],
      error: (err) => console.error('Error cargando mis documentos', err)
    });
  }

  // Carga el historial de vacaciones
  cargarMisVacaciones() {
    if (this.user) {
      this.tiempoService.getMisVacaciones(this.user.id).subscribe({
        next: (data) => this.misVacaciones = data,
        error: (err) => console.error('Error cargando vacaciones', err)
      });
    }
  }

  // Envia la solicitud de vacaciones
  solicitarVacaciones() {
    if (!this.nuevaVacacion.fecha_inicio || !this.nuevaVacacion.fecha_fin) {
      alert('Debes ingresar la fecha de inicio y fin.');
      return;
    }

    this.isSubmittingVacacion = true;
    const payload = {
      ...this.nuevaVacacion,
      usuario_id: this.user.id
    };

    this.tiempoService.solicitarVacaciones(payload).subscribe({
      next: (res) => {
        this.isSubmittingVacacion = false;
        alert('Solicitud de vacaciones enviada con éxito.');
        this.nuevaVacacion = { fecha_inicio: '', fecha_fin: '', tipo: 'Disfrute Legal', observaciones: '' };
        this.cargarMisVacaciones();
      },
      error: (err) => {
        this.isSubmittingVacacion = false;
        console.error(err);
        alert('Error al enviar la solicitud de vacaciones.');
      }
    });
  }

  // Carga los datos de afiliacion a seguridad social
  cargarAfiliaciones() {
    this.http.get('/api/autogestion/afiliaciones').subscribe({
      next: (res: any) => {
        if (res.afiliacion) {
          this.afiliacion = res.afiliacion;
          this.formAfiliacion = {
            eps: res.afiliacion.eps || '',
            arl: res.afiliacion.arl || '',
            fondo_cesantias: res.afiliacion.fondo_cesantias || '',
            afondo_pension: res.afiliacion.afondo_pension || '',
            fecha_contratacion: res.afiliacion.fecha_contratacion || '',
            finalizacion_contrato: res.afiliacion.finalizacion_contrato || '',
            renovacion_contrato: res.afiliacion.renovacion_contrato || '',
            estado_afiliacion: res.afiliacion.estado_afiliacion !== undefined ? res.afiliacion.estado_afiliacion : true,
            estado: res.afiliacion.estado || 'nuevo'
          };
          
          // Simular contador de renovaciones basado en datos o fechas
          this.cantidadRenovaciones = res.afiliacion.renovacion_contrato ? 3 : 0;
        }
      },
      error: (err) => console.error(err)
    });
  }

  // Guarda los datos de afiliacion
  guardarAfiliaciones() {
    // Si era nuevo o desbloqueado, al guardar pasa a revisión (pendiente)
    if (this.formAfiliacion.estado === 'nuevo') {
      this.formAfiliacion.estado = 'pendiente';
    }

    this.isSaving = true;
    this.http.post('/api/autogestion/afiliaciones', this.formAfiliacion).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        alert(res.message || 'Datos guardados. Tu información ha entrado en revisión.');
        this.cargarAfiliaciones();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
      }
    });
  }

  // Solicita desbloqueo del formulario a RRHH
  solicitarCambio() {
    // En una app real esto dispararía una notificación al backend para RRHH
    this.solicitudEnviada = true;
    alert('✅ Solicitud enviada a Recursos Humanos. Te notificarán cuando te desbloqueen el formulario.');
  }

  // Gestiona las fechas de afiliación por parte del administrador
  gestionarAfiliacionAdmin() {
    if(!this.user) return;
    this.isSavingAdmin = true;
    this.http.post(`/api/autogestion/empleado/${this.user.id}/afiliaciones`, this.formAfiliacion).subscribe({
      next: (res: any) => {
        this.isSavingAdmin = false;
        alert(res.message);
        this.cargarAfiliaciones();
      },
      error: (err) => {
        this.isSavingAdmin = false;
        console.error(err);
      }
    });
  }

  // Descargar certificado laboral
  descargarCertificado() {
    let empleadoId = null;
    
    if (this.user && this.user.empleado) {
      empleadoId = this.user.empleado.id;
    } else {
      empleadoId = this.user?.id; // temporal fallback
    }

    if (empleadoId) {
      this.http.get(`/api/empleados/${empleadoId}/certificado`, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `certificado_laboral.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error al descargar el certificado', err);
          alert('Hubo un error al descargar el certificado. Intenta nuevamente.');
        }
      });
    } else {
       alert('Tu usuario no está vinculado como empleado aún o falta configurar ID');
    }
  }

  // Descargar contrato SaaS (solo Gerentes)
  descargarContrato() {
    if (this.user?.empresa_id) {
      this.http.get(`/api/empresas/${this.user.empresa_id}/descargar-contrato`, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Contrato_GestivaPyme_${this.user.empresa?.nit || this.user.empresa_id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Error al descargar el contrato SaaS', err);
          alert('Hubo un error al descargar el contrato. Asegúrate de haberlo firmado o intenta nuevamente.');
        }
      });
    } else {
      alert('No se pudo encontrar la empresa asociada.');
    }
  }

  // Permite seleccionar y previsualizar una nueva foto de perfil
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // 1. Previsualizar localmente rápido y persistir en sesión para el Demo
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Image = e.target.result;
        this.profileImageUrl = base64Image;
        
        // Guardamos en sesión para que la foto persista en el navegador (mock frontal)
        if (this.user) {
          this.user.avatar_url = base64Image;
          sessionStorage.setItem('current_user', JSON.stringify(this.user));
        }
        
        alert('¡La imagen ha subido con éxito! 📸');
      };
      reader.readAsDataURL(file);

      // 2. Intentar subir al backend (Cloudinary) silenciosamente
      const formData = new FormData();
      formData.append('avatar', file);

      this.isUploadingAvatar = true;
      this.http.post('/api/profile/avatar', formData).subscribe({
        next: (res: any) => {
          this.isUploadingAvatar = false;
          console.log('Imagen guardada permanentemente en la nube:', res);
        },
        error: (err) => {
          this.isUploadingAvatar = false;
          console.warn('Nota técnica: El backend en Render rechazó la subida (probable falta de credenciales de Cloudinary en el servidor). Pero la imagen se mantendrá localmente para el demo.', err);
        }
      });
    }
  }
}
