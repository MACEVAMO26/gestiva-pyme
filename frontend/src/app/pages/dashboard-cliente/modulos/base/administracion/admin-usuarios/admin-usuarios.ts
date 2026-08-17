import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner';
import { timeout } from 'rxjs';
import { UsuariosService } from '../../../../../../services/usuarios.service';
import { ToastService } from '../../../../../../services/toast.service';
import { AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.scss'
})
export class AdminUsuarios implements OnInit {
  private usuariosService = inject(UsuariosService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  usuarios: any[] = [];
  isLoading = true;
  showModal = false;
  isSubmitting = false;
  errorMessage = '';

  // LEY: El Gerente General es el primer cargo de la empresa y el único autorizado
  // para inactivar al Jefe de Recursos Humanos (los datos se conservan por ley colombiana).
  esGerente(): boolean {
    const rol = this.authService.getUser()?.rol?.nombre;
    return rol === 'Gerente General' || rol === 'Gerente';
  }

  esJefeRRHH(usuario: any): boolean {
    return usuario?.rol?.nombre === 'Jefe de Área';
  }

  esGerenteGeneral(usuario: any): boolean {
    return usuario?.rol?.nombre === 'Gerente General';
  }

  // Un empleado regular siempre puede inactivarse desde aquí;
  // el Jefe de RRHH SOLO puede inactivarlo el gerente; el gerente nunca.
  puedeInactivar(usuario: any): boolean {
    if (this.esGerenteGeneral(usuario)) return false;
    if (this.esJefeRRHH(usuario)) return this.esGerente();
    return true;
  }

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
    if (!this.puedeInactivar(usuario)) {
      if (this.esGerenteGeneral(usuario)) {
        this.toast.error('El Gerente General no puede ser inactivado.');
      } else {
        this.toast.error('Solo el Gerente General puede inactivar al Jefe de Recursos Humanos.');
      }
      return;
    }

    const accion = usuario.activo ? 'inactivar' : 'activar';
    if (!confirm(`¿Estás seguro de ${accion} a ${usuario.nombres} ${usuario.apellidos}?`)) return;

    this.usuariosService.changeStatus(usuario.id).subscribe({
      next: (res) => {
        usuario.activo = !usuario.activo;
        this.toast.success(res.message || 'Estado actualizado');
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Error al cambiar el estado del usuario');
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
