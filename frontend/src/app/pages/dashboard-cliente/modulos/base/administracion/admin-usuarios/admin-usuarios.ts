import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';
import { UsuariosService } from '../../../../../../services/usuarios.service';
import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.scss'
})
export class AdminUsuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: any[] = [];
  isLoading = true;
  isModalOpen = false;
  isSaving = false;

  nuevoUsuario = {
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    tipo_documento: 'CC',
    documento: '',
    email_personal: '',
    telefono: '',
    direccion: ''
  };

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.isLoading = true;
    this.usuariosService.getUsuarios().pipe(timeout(10000)).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('No se pudieron cargar los usuarios');
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar actualización de la vista
      }
    });
  }

  abrirModal() { 
    this.nuevoUsuario = {
      primer_nombre: '', segundo_nombre: '', primer_apellido: '', segundo_apellido: '',
      tipo_documento: 'CC', documento: '', email_personal: '', telefono: '', direccion: ''
    };
    this.isModalOpen = true; 
  }
  
  cerrarModal() { 
    this.isModalOpen = false; 
  }

  guardarUsuario() {
    if (!this.nuevoUsuario.primer_nombre || !this.nuevoUsuario.primer_apellido || !this.nuevoUsuario.documento || !this.nuevoUsuario.email_personal) {
      this.toast.warning('Por favor llena todos los campos obligatorios');
      return;
    }

    this.isSaving = true;
    this.usuariosService.createUsuario(this.nuevoUsuario).subscribe({
      next: (res) => {
        this.toast.success('Usuario creado exitosamente');
        this.isSaving = false;
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.error(err.error?.message || 'Error al crear el usuario');
      }
    });
  }

  cambiarEstado(usuario: any) {
    this.usuariosService.changeStatus(usuario.id).subscribe({
      next: (res) => {
        usuario.activo = !usuario.activo;
        this.toast.success(res.message || 'Estado actualizado');
      },
      error: (err) => {
        this.toast.error('Error al cambiar el estado del usuario');
      }
    });
  }
}
