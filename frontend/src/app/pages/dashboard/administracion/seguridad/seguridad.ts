import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seguridad.html',
  styleUrl: './seguridad.scss',
})
export class Seguridad implements OnInit {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  roles: any[] = [];
  permisos: any[] = [];
  selectedRole: any = null;
  isLoading = true;
  isLoadingPermisos = false;
  isSubmitting = false;
  showModal = false;

  formData: any = {
    nombre: '',
    descripcion: ''
  };

  // Modulos principales que pueden tener permisos
  modulosDisponibles = ['Administración', 'Gestión Humana', 'Clientes', 'Ventas', 'Inventario', 'Compras', 'Caja'];

  ngOnInit() {
    this.cargarRoles();
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
      'Accept': 'application/json'
    };
  }

  cargarRoles() {
    this.isLoading = true;
    this.http.get<any[]>('/api/roles', { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.roles = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando roles', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarRol(rol: any) {
    this.selectedRole = rol;
    this.cargarPermisos(rol.id);
  }

  cargarPermisos(rolId: number) {
    this.isLoadingPermisos = true;
    this.http.get<any[]>(`/api/roles/${rolId}/permisos`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.permisos = data;
        this.isLoadingPermisos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando permisos', err);
        this.isLoadingPermisos = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirModalNuevoRol() {
    this.formData = { nombre: '', descripcion: '' };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardarRol() {
    if (!this.formData.nombre) return;
    this.isSubmitting = true;

    this.http.post('/api/roles', this.formData, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.cargarRoles();
        this.cerrarModal();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        alert(err.error?.message || 'Error al crear rol');
      }
    });
  }

  // Helpers para gestionar los permisos temporalmente en la vista
  getPermisoParaModulo(modulo: string) {
    return this.permisos.find(p => p.modulo === modulo) || {
      rol_id: this.selectedRole.id,
      modulo: modulo,
      puede_ver: false,
      puede_crear: false,
      puede_editar: false,
      puede_inactivar: false
    };
  }

  guardarPermiso(permiso: any) {
    if (permiso.id) {
      this.http.put(`/api/permisos/${permiso.id}`, permiso, { headers: this.getHeaders() }).subscribe({
        next: () => console.log('Permiso actualizado'),
        error: (err) => console.error(err)
      });
    } else {
      this.http.post('/api/permisos', permiso, { headers: this.getHeaders() }).subscribe({
        next: (data) => {
          this.permisos.push(data); // Añadir para que ya tenga ID y se actualice en la prox.
        },
        error: (err) => console.error(err)
      });
    }
  }

  togglePermiso(modulo: string, accion: 'puede_ver' | 'puede_crear' | 'puede_editar' | 'puede_inactivar') {
    let permiso = this.getPermisoParaModulo(modulo);
    permiso[accion] = !permiso[accion];
    this.guardarPermiso(permiso);
  }
}
