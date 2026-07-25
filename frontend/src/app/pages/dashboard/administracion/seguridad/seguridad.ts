import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';

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
  isSavingPermisos = false;
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

  getPermisoParaModulo(modulo: string) {
    let p = this.permisos.find(p => p.modulo === modulo);
    if (!p) {
      p = {
        rol_id: this.selectedRole.id,
        modulo: modulo,
        puede_ver: false,
        puede_crear: false,
        puede_editar: false,
        puede_inactivar: false
      };
      this.permisos.push(p);
    }
    return p;
  }

  togglePermiso(modulo: string, accion: 'puede_ver' | 'puede_crear' | 'puede_editar' | 'puede_inactivar') {
    let permiso = this.getPermisoParaModulo(modulo);
    permiso[accion] = !permiso[accion];
    // No guardamos automáticamente, se guarda con el botón Guardar
  }

  guardarTodosLosPermisos() {
    this.isSavingPermisos = true;
    
    // Filtrar los permisos que tienen algún valor (aunque Angular los maneja todos si los recorremos)
    const requests: Observable<any>[] = [];
    
    for (let p of this.permisos) {
      if (p.id) {
        requests.push(this.http.put(`/api/permisos/${p.id}`, p, { headers: this.getHeaders() }));
      } else {
        requests.push(this.http.post('/api/permisos', p, { headers: this.getHeaders() }));
      }
    }

    if (requests.length === 0) {
      this.isSavingPermisos = false;
      return;
    }

    forkJoin(requests).subscribe({
      next: (responses) => {
        // Actualizamos los IDs de los nuevos permisos si es necesario recargándolos
        this.cargarPermisos(this.selectedRole.id);
        this.isSavingPermisos = false;
        alert('Permisos guardados correctamente.');
      },
      error: (err) => {
        console.error('Error guardando permisos:', err);
        this.isSavingPermisos = false;
        alert('Hubo un error al guardar los permisos.');
      }
    });
  }
}
