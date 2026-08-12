import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';
import { RolesService } from '../../../../../../services/roles.service';
import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-roles.html',
  styleUrl: './admin-roles.scss'
})
export class AdminRoles implements OnInit {
  private rolesService = inject(RolesService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  roles: any[] = [];
  isLoading = true;
  isModalOpen = false;
  isSaving = false;

  nuevoRol = {
    nombre: '',
    descripcion: ''
  };

  ngOnInit() {
    this.cargarRoles();
  }

  cargarRoles() {
    this.isLoading = true;
    this.rolesService.getRoles().pipe(timeout(5000)).subscribe({
      next: (data) => {
        this.roles = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('No se pudieron cargar los roles');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModal() { 
    this.nuevoRol = {
      nombre: '', descripcion: ''
    };
    this.isModalOpen = true; 
  }
  
  cerrarModal() { 
    this.isModalOpen = false; 
  }

  guardarRol() {
    if (!this.nuevoRol.nombre) {
      this.toast.warning('Por favor ingresa un nombre para el rol');
      return;
    }

    this.isSaving = true;
    this.rolesService.createRole(this.nuevoRol).subscribe({
      next: (res) => {
        this.toast.success('Rol creado exitosamente');
        this.isSaving = false;
        this.cerrarModal();
        this.cargarRoles();
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.error(err.error?.message || 'Error al crear el rol');
      }
    });
  }

  cambiarEstado(rol: any) {
    if (rol.es_base) {
      this.toast.warning('No puedes desactivar un rol base del sistema');
      return;
    }

    this.rolesService.changeStatus(rol.id).subscribe({
      next: (res) => {
        rol.activo = !rol.activo;
        this.toast.success(res.message || 'Estado actualizado');
      },
      error: (err) => {
        this.toast.error('Error al cambiar el estado del rol');
      }
    });
  }
}
