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
  usuarios: any[] = [];
  isLoading = false;
  
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

  cargarUsuarios() {
    this.isLoading = true;
    const token = sessionStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // Asumimos que /api/usuarios nos trae los usuarios de la empresa
    this.http.get<any[]>('http://127.0.0.1:8000/api/usuarios', { headers })
      .subscribe({
        next: (data) => {
          this.usuarios = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
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

    this.http.post<any>('http://127.0.0.1:8000/api/usuarios', this.formData, { headers })
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
}
