import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Cliente {
  id?: number;
  nombres: string;
  apellidos?: string;
  documento: string;
  email?: string;
  telefono?: string;
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

  // --- VARIABLES DE ESTADO ---
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  
  mostrarModal = false;
  isEditMode = false;
  
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
      tipo_cliente: 'Particular',
      membresia: '',
      pedidos_activos: 0,
      estado_pedido: '',
      estado_financiero: 'Al dia',
      comentarios: ''
    };
  }

  cargarClientes() {
    this.http.get<Cliente[]>('http://localhost:8000/api/clientes', {
      headers: { 'X-Empresa-Id': localStorage.getItem('empresa_activa_id') || '' }
    }).subscribe({
      next: (data) => {
        this.clientes = data;
        this.filtrarClientes();
      },
      error: (err) => console.error('Error cargando clientes:', err)
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
    const headers = { 'X-Empresa-Id': localStorage.getItem('empresa_activa_id') || '' };

    if (this.isEditMode && this.clienteActual.id) {
      // PUT
      this.http.put('http://localhost:8000/api/clientes/' + this.clienteActual.id, this.clienteActual, { headers })
        .subscribe({
          next: () => {
            this.cargarClientes();
            this.cerrarModal();
          },
          error: (err) => console.error('Error actualizando cliente', err)
        });
    } else {
      // POST
      this.http.post('http://localhost:8000/api/clientes', this.clienteActual, { headers })
        .subscribe({
          next: () => {
            this.cargarClientes();
            this.cerrarModal();
          },
          error: (err) => console.error('Error creando cliente', err)
        });
    }
  }

  eliminarCliente(id?: number) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      const headers = { 'X-Empresa-Id': localStorage.getItem('empresa_activa_id') || '' };
      this.http.delete('http://localhost:8000/api/clientes/' + id, { headers })
        .subscribe({
          next: () => this.cargarClientes(),
          error: (err) => console.error('Error eliminando cliente', err)
        });
    }
  }
}
