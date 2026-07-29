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
    id: null,
    nombre: '',
    descripcion: '',
    es_base: false
  };

  // Modulos principales que pueden tener permisos (ahora dinámicos)
  modulosDisponibles: string[] = [];
  empresaId: string | number = '';

  ngOnInit() {
    const userDataStr = sessionStorage.getItem('user_data');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      this.empresaId = user?.empresa_id || user?.empresa?.id || '';
    }
    this.cargarModulos();
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

  cargarModulos() {
    if (!this.empresaId) return;
    this.http.get<any>(`/api/empresas/${this.empresaId}/modulos`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        const modulosList: string[] = [];
        const grupos = res.modulos || {};
        
        for (const paquete in grupos) {
          const modulosDelPaquete = grupos[paquete];
          for (const mod of modulosDelPaquete) {
            if (mod.activo && mod.asignado) {
              modulosList.push(mod.nombre);
            }
          }
        }
        this.modulosDisponibles = modulosList;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando modulos', err);
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
    this.formData = { id: null, nombre: '', descripcion: '', es_base: false };
    this.showModal = true;
  }

  editarRol(rol: any, event: Event) {
    event.stopPropagation();
    this.formData = { 
      id: rol.id, 
      nombre: rol.nombre, 
      descripcion: rol.descripcion,
      es_base: rol.es_base 
    };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardarRol() {
    if (!this.formData.nombre && !this.formData.es_base) return;
    this.isSubmitting = true;

    if (this.formData.id) {
      this.http.put(`/api/roles/${this.formData.id}`, this.formData, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.cargarRoles();
          this.cerrarModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert(err.error?.message || 'Error al actualizar rol');
        }
      });
    } else {
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
        puede_inactivar: false,
        puede_descargar: false,
        puede_subir: false
      };
      this.permisos.push(p);
    }
    return p;
  }

  togglePermiso(modulo: string, accion: 'puede_ver' | 'puede_crear' | 'puede_editar' | 'puede_inactivar' | 'puede_descargar' | 'puede_subir') {
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
