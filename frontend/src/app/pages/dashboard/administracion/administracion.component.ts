import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { PagosComponent } from '../pagos/pagos.component';

import { UsuariosComponent } from './usuarios/usuarios.component';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, FormsModule, PagosComponent, UsuariosComponent],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.scss'
})
export class AdministracionComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);

  // --- VARIABLES DE ESTADO ---
  user: any = null;
  empresa: any = null;
  currentView: string = 'dashboard';
  formData: any = {};
  isSubmitting = false;
  logoFile: File | null = null;
  documentoFile: File | null = null;
  misSolicitudes: any[] = [];

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user && this.user.empresa) {
      this.empresa = this.user.empresa;
      this.formData = {
        razon_social: this.empresa.razon_social,
        nit: this.empresa.nit,
        telefono: this.empresa.telefono || '',
        direccion: this.empresa.direccion || '',
        email: this.empresa.email || '',
        eslogan: ''
      };
    }
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    const token = sessionStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    this.http.get<any[]>('/api/admin-requests/my-requests', { headers })
      .subscribe({
        next: (data) => this.misSolicitudes = data,
        error: (err) => console.error('Error al cargar solicitudes', err)
      });
  }

  onLogoSelected(event: any) {
    if (event.target.files.length > 0) {
      this.logoFile = event.target.files[0];
    }
  }

  onDocumentoSelected(event: any) {
    if (event.target.files.length > 0) {
      this.documentoFile = event.target.files[0];
    }
  }

  goToView(view: string) {
    this.currentView = view;
  }

  goToPagos() {
    this.currentView = 'pagos';
  }

  goToUsuarios() {
    this.currentView = 'usuarios';
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

    const body = new FormData();
    body.append('tipo', tipo);
    
    if (datosNuevos) {
      body.append('datos_nuevos', JSON.stringify(datosNuevos));
    }

    if (this.logoFile && tipo === 'cambio_datos') {
      body.append('logo', this.logoFile);
    }
    
    if (this.documentoFile && tipo === 'cambio_datos') {
      body.append('documento', this.documentoFile);
    }

    this.http.post('/api/admin-requests', body, { headers })
      .subscribe({
        next: () => {
          alert('¡Solicitud enviada exitosamente a GestivaPyme!');
          this.isSubmitting = false;
          this.logoFile = null;
          this.documentoFile = null;
          this.cargarSolicitudes();
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

