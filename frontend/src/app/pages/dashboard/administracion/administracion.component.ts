import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { PagosComponent } from '../pagos/pagos.component';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, FormsModule, PagosComponent],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.scss'
})
export class AdministracionComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);

  user: any = null;
  empresa: any = null;

  // View state: 'dashboard' | 'info-empresa'
  currentView: string = 'dashboard';

  // Formulario
  formData: any = {};
  isSubmitting = false;

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user && this.user.empresa) {
      this.empresa = this.user.empresa;
      this.formData = {
        nombre: this.empresa.razon_social,
        nit: this.empresa.nit,
        telefono: this.empresa.telefono || '',
        direccion: this.empresa.direccion || '',
        email: this.empresa.email || '',
        eslogan: ''
      };
    }
  }

  goToView(view: string) {
    this.currentView = view;
  }

  goToPagos() {
    this.currentView = 'pagos';
  }

  solicitarCambioDatos() {
    this.enviarSolicitud('cambio_datos', this.formData);
  }

  solicitarSoporte() {
    this.enviarSolicitud('soporte');
  }

  solicitarMigracion() {
    this.enviarSolicitud('migracion');
  }

  private enviarSolicitud(tipo: string, datosNuevos?: any) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const token = sessionStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    const body: any = { tipo: tipo };
    if (datosNuevos) {
      body.datos_nuevos = datosNuevos;
    }

    this.http.post('http://127.0.0.1:8000/api/admin-requests', body, { headers })
      .subscribe({
        next: () => {
          alert('¡Solicitud enviada exitosamente a GestivaPyme!');
          this.isSubmitting = false;
          if (tipo === 'cambio_datos') {
            this.goToView('dashboard');
          }
        },
        error: (err) => {
          console.error(err);
          alert('Ocurrió un error al enviar la solicitud.');
          this.isSubmitting = false;
        }
      });
  }
}

