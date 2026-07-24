import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

export interface Proveedor {
  id?: number;
  razon_social: string;
  nit: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  documentos_url?: string;
}

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss']
})
export class ProveedoresComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // --- VARIABLES DE ESTADO ---
  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  
  // Modal y Formulario
  showModal = false;
  isEditMode = false;
  isSaving = false;
  deletingId: number | null = null;
  proveedorActual: Proveedor = this.getEmptyProveedor();
  
  // Filtros
  searchTerm = '';

  ngOnInit() {
    this.cargarProveedores();
  }

  getEmptyProveedor(): Proveedor {
    return {
      razon_social: '',
      nit: '',
      contacto: '',
      email: '',
      telefono: '',
      direccion: '',
      documentos_url: ''
    };
  }

  formatearId(id: number | undefined): string {
    if (!id) return 'PROV-000';
    return 'PROV' + id.toString().padStart(5, '0');
  }

  cargarProveedores() {
    const user = this.authService.getUser();
    const empresaId = user?.empresa_id || user?.empresa?.id || '';

    this.http.get<Proveedor[]>('/api/proveedores', {
      headers: { 'X-Empresa-Id': empresaId.toString() }
    }).subscribe({
      next: (data) => {
        this.proveedores = data;
        this.filtrarProveedores();
      },
      error: (err) => {
        console.error('Error cargando proveedores:', err);
        this.toastService.show('Error cargando la lista de proveedores', 'error');
      }
    });
  }

  filtrarProveedores() {
    if (!this.searchTerm) {
      this.proveedoresFiltrados = [...this.proveedores];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(p => 
      p.razon_social.toLowerCase().includes(term) ||
      p.nit.toLowerCase().includes(term) ||
      (p.contacto && p.contacto.toLowerCase().includes(term))
    );
  }

  abrirModal(proveedor?: Proveedor) {
    if (proveedor) {
      this.isEditMode = true;
      this.proveedorActual = { ...proveedor };
    } else {
      this.isEditMode = false;
      this.proveedorActual = this.getEmptyProveedor();
    }
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.proveedorActual = this.getEmptyProveedor();
  }

  guardarProveedor() {
    this.isSaving = true;
    const user = this.authService.getUser();
    const empresaId = user?.empresa_id || user?.empresa?.id || '';
    const headers = { 'X-Empresa-Id': empresaId.toString() };

    if (this.isEditMode && this.proveedorActual.id) {
      // PUT
      this.http.put('/api/proveedores/' + this.proveedorActual.id, this.proveedorActual, { headers })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.toastService.show('Proveedor actualizado con éxito', 'success');
            this.cargarProveedores();
            this.cerrarModal();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Error actualizando proveedor', err);
            const msg = err.error?.message || err.message || 'Error al actualizar el proveedor';
            this.toastService.show(msg, 'error');
          }
        });
    } else {
      // POST
      this.http.post('/api/proveedores', this.proveedorActual, { headers })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.toastService.show('Proveedor guardado con éxito', 'success');
            this.cargarProveedores();
            this.cerrarModal();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Error creando proveedor', err);
            const msg = err.error?.message || err.error?.error || err.message || 'Error al guardar el proveedor';
            this.toastService.show(msg, 'error');
          }
        });
    }
  }

  eliminarProveedor(id?: number) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      this.deletingId = id;
      const user = this.authService.getUser();
      const empresaId = user?.empresa_id || user?.empresa?.id || '';
      const headers = { 'X-Empresa-Id': empresaId.toString() };
      
      this.http.delete('/api/proveedores/' + id, { headers })
        .subscribe({
          next: () => {
            this.deletingId = null;
            this.toastService.show('Proveedor eliminado con éxito', 'success');
            this.cargarProveedores();
          },
          error: (err) => {
            this.deletingId = null;
            console.error('Error eliminando proveedor', err);
            this.toastService.show('Error al eliminar el proveedor', 'error');
          }
        });
    }
  }
}
