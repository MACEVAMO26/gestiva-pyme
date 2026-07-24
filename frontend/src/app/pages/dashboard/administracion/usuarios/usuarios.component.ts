import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
})
export class UsuariosComponent implements OnInit {
  http = inject(HttpClient);

  // --- ESTADOS ---
  isApprovingBaja = false;
  usuarios: any[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Modal de Creación
  showModal = false;
  isSubmitting = false;
  formData = {
    nombres: '',
    apellidos: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: ''
  };
  
  // Alerta post-creación
  tempPasswordGenerated = '';
  nuevoUsuarioNombre = '';

  ngOnInit() {
    this.cargarUsuarios();
  }

  // Para traer la lista de usuarios de la empresa actual
  cargarUsuarios() {
    this.isLoading = true;
    this.errorMessage = '';
    const token = sessionStorage.getItem('auth_token');

    this.http.get<any[]>('/api/usuarios', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.errorMessage = 'No se pudieron cargar los usuarios.';
        this.isLoading = false;
      }
    });
  }

  abrirModal() {
    this.resetForm();
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.tempPasswordGenerated = '';
  }

  resetForm() {
    this.formData = {
      nombres: '', apellidos: '', documento: '',
      email: '', telefono: '', direccion: ''
    };
    this.tempPasswordGenerated = '';
  }

  crearUsuario() {
    this.isSubmitting = true;
    const token = sessionStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post<any>('/api/usuarios', this.formData, { headers })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          // Mostramos la alerta con la contraseña generada
          this.tempPasswordGenerated = res.temp_password;
          this.nuevoUsuarioNombre = `${res.user.nombres} ${res.user.apellidos}`;
          this.cargarUsuarios(); // Recarga la tabla
        },
        error: (err) => {
          this.isSubmitting = false;
          alert('Error al crear el usuario. Verifique los datos o que el documento/correo no existan ya.');
          console.error(err);
        }
      });
  }

  aprobarBaja(usuario: any) {
    if (!usuario.empleado) return;
    if (!confirm(`¿Está seguro de aprobar la inactivación del empleado ${usuario.nombres} ${usuario.apellidos}? Esta acción bloqueará su acceso al sistema.`)) {
      return;
    }

    this.isApprovingBaja = true;
    const token = sessionStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post<any>(`/api/empleados/${usuario.empleado.id}/aprobar-baja`, {}, { headers })
      .subscribe({
        next: (res) => {
          this.isApprovingBaja = false;
          alert(res.message);
          this.cargarUsuarios(); // Recarga la tabla para reflejar el estado inactivo
        },
        error: (err) => {
          this.isApprovingBaja = false;
          console.error(err);
          alert('Error al aprobar la inactivación.');
        }
      });
  }
}
