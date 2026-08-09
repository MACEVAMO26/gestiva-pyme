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

  // --- VARIABLES DE ESTADO ---
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
  todosLosModulosDeEmpresa: any[] = [];
  modulosDisponibles: any[] = [];
  empresaId: string | number = '';

  // Inicializa cargando modulos y roles
  ngOnInit() {
    const userDataStr = sessionStorage.getItem('user_data');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      this.empresaId = user?.empresa_id || user?.empresa?.id || '';
    }
    this.cargarModulos();
    this.cargarRoles();
  }

  // Obtiene los headers con el token
  getHeaders() {
    return {
      'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
      'Accept': 'application/json'
    };
  }

  // Carga los roles del servidor
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

  // Carga los modulos disponibles para la empresa
  cargarModulos() {
    this.http.get<any>(`/api/mis-modulos`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        const modulosList: any[] = [];
        const grupos = res.modulos || {};
        for (const paquete in grupos) {
          const modulosDelPaquete = grupos[paquete];
          if (Array.isArray(modulosDelPaquete)) {
            for (const mod of modulosDelPaquete) {
              if (mod.asignado) {
                modulosList.push({ id: mod.id, nombre: mod.nombre });
              }
            }
          }
        }
        this.todosLosModulosDeEmpresa = modulosList;
        this.modulosDisponibles = [...this.todosLosModulosDeEmpresa];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando módulos', err);
        this.modulosDisponibles = [{id: 'debug_error', nombre: 'Error cargando módulos'}];
        this.cdr.detectChanges();
      }
    });
  }

  // Selecciona un rol para ver sus permisos
  seleccionarRol(rol: any) {
    this.selectedRole = rol;
    this.cargarPermisos(rol.id);
  }

  // Carga los permisos asociados a un rol
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

  // Abre el modal para nuevo rol
  abrirModalNuevoRol() {
    this.formData = { id: null, nombre: '', descripcion: '', es_base: false };
    this.showModal = true;
  }

  // Abre el modal en modo edicion
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

  // Cierra el modal activo
  cerrarModal() {
    this.showModal = false;
  }

  // Guarda el rol creado o modificado
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

  // Obtiene los permisos para un modulo especifico
  getPermisoParaModulo(moduloId: string) {
    if (!this.permisos || !Array.isArray(this.permisos)) return { puede_ver: false, puede_crear: false, puede_editar: false, puede_inactivar: false, puede_descargar: false, puede_subir: false };
    const permiso = this.permisos.find(p => p.modulo === moduloId);
    return permiso || { puede_ver: false, puede_crear: false, puede_editar: false, puede_inactivar: false, puede_descargar: false, puede_subir: false };
  }

  // Alterna un permiso especifico
  togglePermiso(moduloId: string, campo: string) {
    if (!this.permisos) this.permisos = [];
    let permiso = this.permisos.find(p => p.modulo === moduloId);
    if (!permiso) {
      permiso = {
        modulo: moduloId,
        rol_id: this.selectedRole.id,
        puede_ver: false,
        puede_crear: false,
        puede_editar: false,
        puede_inactivar: false,
        puede_descargar: false,
        puede_subir: false
      };
      this.permisos.push(permiso);
    }
    permiso[campo] = !permiso[campo];
    this.cdr.detectChanges();
  }

  // Guarda todos los permisos configurados
  guardarTodosLosPermisos() {
    this.isSavingPermisos = true;
    
    // Batch save for optimization
    this.http.post('/api/permisos/batch', { permisos: this.permisos }, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        // Recargar los permisos para obtener los IDs generados
        this.cargarPermisos(this.selectedRole.id);
        this.isSavingPermisos = false;
        
        // Show success alert
        const alertHtml = `
          <div id="toast-success" style="position: fixed; top: 20px; right: 20px; background: rgba(42, 38, 69, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-left: 4px solid #10b981; border-radius: 10px; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 9999; animation: slideIn 0.3s ease-out;">
            <div style="background: rgba(16, 185, 129, 0.2); border-radius: 50%; padding: 0.5rem; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 20px; height: 20px; color: #10b981;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div>
              <h4 style="margin: 0; color: #10b981; font-weight: 600; font-size: 0.95rem;">Permisos Guardados</h4>
              <p style="margin: 0.2rem 0 0 0; color: #cbd5e1; font-size: 0.8rem;">Todos los accesos han sido actualizados con éxito.</p>
            </div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0; margin-left: auto;">
              <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        `;
        document.body.insertAdjacentHTML('beforeend', alertHtml);
        setTimeout(() => {
          const el = document.getElementById('toast-success');
          if (el) el.remove();
        }, 3000);
      },
      error: (err) => {
        console.error('Error al guardar permisos', err);
        this.isSavingPermisos = false;
        alert('Error al guardar los permisos.');
      }
    });
  }
}
