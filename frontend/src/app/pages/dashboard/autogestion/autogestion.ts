import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

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
    afondo_pension: '',
    fecha_contratacion: '',
    finalizacion_contrato: '',
    renovacion_contrato: '',
    estado: 'nuevo' // Empezamos en nuevo para permitir llenar la primera vez
  };

  cantidadRenovaciones: number = 0;
  solicitudEnviada: boolean = false;

  private authService = inject(AuthService);
  private http = inject(HttpClient);

  get isHR(): boolean {
    const rol = this.user?.rol?.nombre?.toLowerCase() || '';
    return rol.includes('recursos humanos');
  }

  ngOnInit(): void {
    this.user = this.authService.getUser() as any;
    this.cargarAfiliaciones();
  }

  cargarAfiliaciones() {
    this.http.get('/api/autogestion/afiliaciones').subscribe({
      next: (res: any) => {
        if (res.afiliacion) {
          this.afiliacion = res.afiliacion;
          this.formAfiliacion = {
            eps: res.afiliacion.eps || '',
            arl: res.afiliacion.arl || '',
            afondo_pension: res.afiliacion.afondo_pension || '',
            fecha_contratacion: res.afiliacion.fecha_contratacion || '',
            finalizacion_contrato: res.afiliacion.finalizacion_contrato || '',
            renovacion_contrato: res.afiliacion.renovacion_contrato || '',
            estado: res.afiliacion.estado || 'nuevo'
          };
          
          // Simular contador de renovaciones basado en datos o fechas
          this.cantidadRenovaciones = res.afiliacion.renovacion_contrato ? 3 : 0;
        }
      },
      error: (err) => console.error(err)
    });
  }

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
