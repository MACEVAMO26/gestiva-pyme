import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../../../../services/cliente.service';
import { LeadService, Lead } from '../../../../../services/lead.service';
import { ToastService } from '../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private leadService = inject(LeadService);
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
    this.cargarClientes();
    this.cargarLeads();
  }

  cargarClientes() {
    this.cargando = true;
    this.clienteService.getClientes().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.clientesOriginales = res;
        this.filtrarClientes();
        this.cargando = false;
      },
      error: () => {
        this.clientesOriginales = [];
        this.clientesFiltrados = [];
        this.toast.error('Error al cargar los clientes');
        this.cargando = false;
      }
    });
  }

  cargarLeads() {
    this.leadService.getLeads().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.todosLosLeads = res;
        this.actualizarColumnasLeads();
      },
      error: () => {
        this.todosLosLeads = [];
        this.actualizarColumnasLeads();
      }
    });
  }

  // --- LOGICA CLIENTES (DIRECTORIO) ---
  filtrarClientes() {
    this.clientesFiltrados = this.clientesOriginales.filter(c => {
      const matchSearch = (c.nombres + ' ' + (c.apellidos || '')).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          (c.documento || '').includes(this.searchTerm);
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
      membresia: '', comentarios: '', activo: true
    };
  }

  guardarCliente() {
    if (!this.clienteActual.nombres || !this.clienteActual.documento) {
      this.toast.warning('Nombre y documento son obligatorios');
      return;
    }
    this.isSaving = true;
    const payload: Cliente = { ...this.clienteActual };

    if (this.isEditMode && this.clienteActual.id) {
      this.clienteService.actualizarCliente(this.clienteActual.id, payload).pipe(timeout(8000)).subscribe({
        next: () => {
          this.toast.success('Cliente actualizado');
          this.cargarClientes();
          this.cerrarModal();
          this.isSaving = false;
        },
        error: () => {
          this.toast.error('Error al actualizar el cliente');
          this.isSaving = false;
        }
      });
    } else {
      this.clienteService.crearCliente(payload).pipe(timeout(8000)).subscribe({
        next: () => {
          this.toast.success('Cliente creado exitosamente');
          this.cargarClientes();
          this.cerrarModal();
          this.isSaving = false;
        },
        error: () => {
          this.toast.error('Error al crear el cliente');
          this.isSaving = false;
        }
      });
    }
  }

  eliminarCliente(id: number) {
    this.deletingId = id;
    this.clienteService.eliminarCliente(id).pipe(timeout(8000)).subscribe({
      next: () => {
        this.toast.success('Cliente eliminado');
        this.cargarClientes();
        this.deletingId = null;
      },
      error: () => {
        this.toast.error('Error al eliminar el cliente');
        this.deletingId = null;
      }
    });
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
    if (!this.leadActual.nombre || !this.leadActual.correo || !this.leadActual.telefono) {
      this.toast.warning('Nombre, correo y teléfono son obligatorios');
      return;
    }
    this.isSaving = true;
    const payload: Lead = { ...this.leadActual };

    if (this.isEditMode && this.leadActual.id) {
      this.leadService.actualizarLead(this.leadActual.id, payload).pipe(timeout(8000)).subscribe({
        next: () => {
          this.toast.success('Lead actualizado');
          this.cargarLeads();
          this.cerrarModalLead();
          this.isSaving = false;
        },
        error: () => {
          this.toast.error('Error al actualizar el lead');
          this.isSaving = false;
        }
      });
    } else {
      this.leadService.crearLead(payload).pipe(timeout(8000)).subscribe({
        next: () => {
          this.toast.success('Lead registrado');
          this.cargarLeads();
          this.cerrarModalLead();
          this.isSaving = false;
        },
        error: () => {
          this.toast.error('Error al registrar el lead');
          this.isSaving = false;
        }
      });
    }
  }

  cambiarEstadoLead(lead: any, nuevoEstado: string) {
    this.leadService.actualizarLead(lead.id, { estado: nuevoEstado }).pipe(timeout(8000)).subscribe({
      next: () => {
        lead.estado = nuevoEstado;
        this.actualizarColumnasLeads();
        this.toast.success('Estado del lead actualizado');
      },
      error: () => this.toast.error('Error al actualizar el estado del lead')
    });
  }

  convertirLeadACliente(lead: any) {
    this.abrirModalNuevo();
    this.clienteActual.nombres = lead.nombre;
    this.clienteActual.telefono = lead.telefono;
    this.clienteActual.email = lead.correo;
    this.clienteActual.comentarios = `Viene del Lead ID: ${lead.id}. Notas: ${lead.mensaje || ''}`;
    this.toast.success('Lead trasladado a formulario de Cliente');
  }
}