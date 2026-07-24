import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

export interface Cliente {
  id?: number;
  nombres: string;
  apellidos?: string;
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  tipo_cliente?: string;
  membresia?: string;
  pedidos_activos?: number;
  estado_pedido?: string;
  estado_financiero?: string;
  comentarios?: string;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss']
})
export class ClientesComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // --- VARIABLES DE ESTADO ---
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  
  mostrarModal = false;
  isEditMode = false;
  isSaving = false;
  deletingId: number | null = null;
  
  clienteActual: Cliente = this.getEmptyCliente();

  // Filtros
  searchTerm = '';
  tipoFiltro = '';

  ngOnInit() {
    this.cargarClientes();
  }

  getEmptyCliente(): Cliente {
    return {
      nombres: '',
      apellidos: '',
      documento: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      tipo_cliente: 'Particular',
      membresia: '',
      pedidos_activos: 0,
      estado_pedido: '',
      estado_financiero: 'Al dia',
      comentarios: ''
    };
  }

  formatearId(id: number | undefined): string {
    if (!id) return 'CLI-000';
    return 'CLI' + id.toString().padStart(9, '0');
  }

  cargarClientes() {
    const user = this.authService.getUser();
    const empresaId = user?.empresa_id || user?.empresa?.id || '';

    this.http.get<Cliente[]>('/api/clientes', {
      headers: { 'X-Empresa-Id': empresaId.toString() }
    }).subscribe({
      next: (data) => {
        this.clientes = data;
        this.filtrarClientes();
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.toastService.show('Error cargando la lista de clientes', 'error');
      }
    });
  }

  filtrarClientes() {
    let filtrados = this.clientes;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(c => 
        (c.nombres && c.nombres.toLowerCase().includes(term)) ||
        (c.apellidos && c.apellidos.toLowerCase().includes(term)) ||
        (c.documento && c.documento.includes(term)) ||
        (c.telefono && c.telefono.includes(term))
      );
    }

    if (this.tipoFiltro) {
      filtrados = filtrados.filter(c => c.tipo_cliente === this.tipoFiltro);
    }

    this.clientesFiltrados = filtrados;
  }

  abrirModalNuevo() {
    this.isEditMode = false;
    this.clienteActual = this.getEmptyCliente();
    this.mostrarModal = true;
  }

  editarCliente(cliente: Cliente) {
    this.isEditMode = true;
    this.clienteActual = { ...cliente }; // Copia para no editar en vivo la tabla
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarCliente() {
    this.isSaving = true;
    const user = this.authService.getUser();
    const empresaId = user?.empresa_id || user?.empresa?.id || '';
    const headers = { 'X-Empresa-Id': empresaId.toString() };

    if (this.isEditMode && this.clienteActual.id) {
      // PUT
      this.http.put('/api/clientes/' + this.clienteActual.id, this.clienteActual, { headers })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.toastService.show('Cliente actualizado con éxito', 'success');
            this.cargarClientes();
            this.cerrarModal();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Error actualizando cliente', err);
            const msg = err.error?.message || err.message || 'Error al actualizar el cliente';
            this.toastService.show(msg, 'error');
          }
        });
    } else {
      // POST
      this.http.post('/api/clientes', this.clienteActual, { headers })
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.toastService.show('Cliente guardado con éxito', 'success');
            this.cargarClientes();
            this.cerrarModal();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Error creando cliente', err);
            const msg = err.error?.message || err.error?.error || err.message || 'Error al guardar el cliente';
            this.toastService.show(msg, 'error');
          }
        });
    }
  }

  eliminarCliente(id?: number) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.deletingId = id;
      const user = this.authService.getUser();
      const empresaId = user?.empresa_id || user?.empresa?.id || '';
      const headers = { 'X-Empresa-Id': empresaId.toString() };
      
      this.http.delete('/api/clientes/' + id, { headers })
        .subscribe({
          next: () => {
            this.deletingId = null;
            this.toastService.show('Cliente eliminado con éxito', 'success');
            this.cargarClientes();
          },
          error: (err) => {
            this.deletingId = null;
            console.error('Error eliminando cliente', err);
            this.toastService.show('Error al eliminar el cliente', 'error');
          }
        });
    }
  }
}
