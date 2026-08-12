import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../../../../services/cliente.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private toast = inject(ToastService);

  // Tabs
  tabActiva: 'directorio' | 'leads' = 'directorio';

  // State (Directorio)
  clientesOriginales: any[] = [];
  clientesFiltrados: any[] = [];
  searchTerm: string = '';
  tipoFiltro: string = '';
  
  // State (Leads Kanban)
  todosLosLeads: any[] = [];
  leadsPendientes: any[] = [];
  leadsContactados: any[] = [];
  leadsArchivados: any[] = [];

  // UI State
  cargando = false;
  isSaving = false;
  deletingId: number | null = null;
  mostrarModal = false;
  mostrarModalLead = false;
  isEditMode = false;

  // Forms
  clienteActual: any = this.resetClienteActual();
  leadActual: any = this.resetLeadActual();

  ngOnInit() {
    this.cargarDatosDemo();
  }

  cargarDatosDemo() {
    this.cargando = true;
    
    // Demo Clientes
    this.clientesOriginales = [
      { id: 1, nombres: 'Carlos', apellidos: 'Pérez', documento: '10203040', telefono: '3001234567', email: 'carlos@mail.com', tipo_cliente: 'Particular', membresia: 'VIP', pedidos_activos: 2, estado_pedido: 'En camino', estado_financiero: 'Al dia', comentarios: 'Cliente frecuente' },
      { id: 2, nombres: 'Tech', apellidos: 'Solutions SAS', documento: '900800700', telefono: '3119876543', email: 'contacto@tech.com', tipo_cliente: 'Empresa', membresia: 'Corporate', pedidos_activos: 0, estado_pedido: 'Entregado', estado_financiero: 'Pendiente', comentarios: 'Pagan a 30 días' }
    ];
    this.filtrarClientes();

    // Demo Leads
    this.todosLosLeads = [
      { id: 1, nombre: 'Ana Gómez', telefono: '3200000000', correo: 'ana@mail.com', horario_llamada: 'Tardes', estado: 'pendiente', mensaje: 'Interesada en plan mensual' },
      { id: 2, nombre: 'Luis Martínez', telefono: '3151112233', correo: 'luis@mail.com', horario_llamada: 'Mañana', estado: 'contactado', mensaje: 'Pidió cotización por 50 unidades' },
      { id: 3, nombre: 'Empresa Falsa', telefono: '3009998877', correo: 'fake@mail.com', horario_llamada: '', estado: 'archivado', mensaje: 'No responden' }
    ];
    this.actualizarColumnasLeads();
    
    this.cargando = false;
  }

  // --- LOGICA CLIENTES (DIRECTORIO) ---
  filtrarClientes() {
    this.clientesFiltrados = this.clientesOriginales.filter(c => {
      const matchSearch = (c.nombres + ' ' + c.apellidos).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          c.documento?.includes(this.searchTerm);
      const matchType = this.tipoFiltro ? c.tipo_cliente === this.tipoFiltro : true;
      return matchSearch && matchType;
    });
  }

  obtenerIniciales(nombres: string, apellidos: string): string {
    const n = nombres ? nombres.charAt(0) : '';
    const a = apellidos ? apellidos.charAt(0) : '';
    return (n + a).toUpperCase() || 'C';
  }

  formatearId(id: number): string {
    return id.toString().padStart(4, '0');
  }

  abrirModalNuevo() {
    this.isEditMode = false;
    this.clienteActual = this.resetClienteActual();
    this.mostrarModal = true;
  }

  editarCliente(cliente: any) {
    this.isEditMode = true;
    this.clienteActual = { ...cliente };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  resetClienteActual() {
    return {
      id: null, nombres: '', apellidos: '', documento: '', email: '', 
      telefono: '', tipo_cliente: 'Particular', ciudad: '', direccion: '', 
      membresia: '', comentarios: ''
    };
  }

  guardarCliente() {
    this.isSaving = true;
    setTimeout(() => {
      if (this.isEditMode) {
        const idx = this.clientesOriginales.findIndex(c => c.id === this.clienteActual.id);
        if (idx !== -1) this.clientesOriginales[idx] = { ...this.clienteActual };
      } else {
        this.clienteActual.id = Math.floor(Math.random() * 1000) + 10;
        this.clientesOriginales.push({ ...this.clienteActual });
      }
      this.filtrarClientes();
      this.toast.success(this.isEditMode ? 'Cliente actualizado' : 'Cliente creado exitosamente');
      this.cerrarModal();
      this.isSaving = false;
    }, 800);
  }

  eliminarCliente(id: number) {
    this.deletingId = id;
    setTimeout(() => {
      this.clientesOriginales = this.clientesOriginales.filter(c => c.id !== id);
      this.filtrarClientes();
      this.toast.success('Cliente eliminado');
      this.deletingId = null;
    }, 1000);
  }

  // --- LOGICA LEADS (KANBAN) ---
  actualizarColumnasLeads() {
    this.leadsPendientes = this.todosLosLeads.filter(l => l.estado === 'pendiente');
    this.leadsContactados = this.todosLosLeads.filter(l => l.estado === 'contactado');
    this.leadsArchivados = this.todosLosLeads.filter(l => l.estado === 'archivado');
  }

  abrirModalNuevoLead() {
    this.isEditMode = false;
    this.leadActual = this.resetLeadActual();
    this.mostrarModalLead = true;
  }

  editarLead(lead: any) {
    this.isEditMode = true;
    this.leadActual = { ...lead };
    this.mostrarModalLead = true;
  }

  cerrarModalLead() {
    this.mostrarModalLead = false;
  }

  resetLeadActual() {
    return { id: null, nombre: '', telefono: '', correo: '', horario_llamada: '', estado: 'pendiente', mensaje: '' };
  }

  guardarLead() {
    this.isSaving = true;
    setTimeout(() => {
      if (this.isEditMode) {
        const idx = this.todosLosLeads.findIndex(l => l.id === this.leadActual.id);
        if (idx !== -1) this.todosLosLeads[idx] = { ...this.leadActual };
      } else {
        this.leadActual.id = Math.floor(Math.random() * 1000) + 100;
        this.todosLosLeads.push({ ...this.leadActual });
      }
      this.actualizarColumnasLeads();
      this.toast.success(this.isEditMode ? 'Lead actualizado' : 'Lead registrado');
      this.cerrarModalLead();
      this.isSaving = false;
    }, 800);
  }

  cambiarEstadoLead(lead: any, nuevoEstado: string) {
    const idx = this.todosLosLeads.findIndex(l => l.id === lead.id);
    if (idx !== -1) {
      this.todosLosLeads[idx].estado = nuevoEstado;
      this.actualizarColumnasLeads();
      this.toast.success('Estado del lead actualizado');
    }
  }

  convertirLeadACliente(lead: any) {
    this.abrirModalNuevo();
    this.clienteActual.nombres = lead.nombre;
    this.clienteActual.telefono = lead.telefono;
    this.clienteActual.email = lead.correo;
    this.clienteActual.comentarios = `Viene del Lead ID: ${lead.id}. Notas: ${lead.mensaje}`;
    this.toast.success('Lead trasladado a formulario de Cliente');
  }
}
