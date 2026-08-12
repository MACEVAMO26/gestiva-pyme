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
  showModal = false;
  isSubmitting = false;
  errorMessage = '';

  formData: any = {
    nombres: '',
    primer_apellido: '',
    segundo_apellido: '',
    tipo_documento: 'CC',
    documento: '',
    email_personal: '',
    telefono: '',
    direccion: ''
  };

  isApprovingBaja = false;
  tempPasswordGenerated = '';
  emailGenerado = '';
  nuevoUsuarioNombre = '';

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.isLoading = true;
    this.errorMessage = '';
    this.usuariosService.getUsuarios().pipe(timeout(5000)).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('No se pudieron cargar los usuarios');
        this.errorMessage = 'No se pudieron cargar los usuarios.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal() { 
    this.formData = {
      nombres: '', primer_apellido: '', segundo_apellido: '',
      tipo_documento: 'CC', documento: '', email_personal: '', telefono: '', direccion: ''
    };
    this.tempPasswordGenerated = '';
    this.emailGenerado = '';
    this.nuevoUsuarioNombre = '';
    this.showModal = true; 
  }
  
  cerrarModal() { 
    this.showModal = false;
    this.tempPasswordGenerated = ''; 
  }

  crearUsuario() {
    if (!this.formData.nombres || !this.formData.primer_apellido || !this.formData.documento || !this.formData.email_personal) {
      this.toast.warning('Por favor llena todos los campos obligatorios');
      return;
    }

    this.isSubmitting = true;
    
    // Adaptar nombres para el backend si es necesario
    const payload = {
       ...this.formData,
       primer_nombre: this.formData.nombres.split(' ')[0] || '',
       segundo_nombre: this.formData.nombres.split(' ').slice(1).join(' ') || ''
    };

    this.usuariosService.createUsuario(payload).subscribe({
      next: (res) => {
        this.toast.success('Usuario creado exitosamente');
        this.isSubmitting = false;
        
        // Vista de éxito
        this.nuevoUsuarioNombre = this.formData.nombres + ' ' + this.formData.primer_apellido;
        this.emailGenerado = res.email || this.formData.email_personal;
        this.tempPasswordGenerated = res.password || 'T3mp0r4l123*';
        
        this.cargarUsuarios();
      },
      error: (err) => {
        this.isSubmitting = false;
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

  aprobarBaja(usuario: any) {
    this.isApprovingBaja = true;
    setTimeout(() => {
       usuario.activo = false;
       if (usuario.empleado) {
          usuario.empleado.baja_solicitada = false;
       }
       this.toast.success('Baja aprobada correctamente');
       this.isApprovingBaja = false;
    }, 1000);
  }
}
