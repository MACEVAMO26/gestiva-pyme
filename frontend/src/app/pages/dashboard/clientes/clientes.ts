import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { LeadService, Lead } from '../../../services/lead.service';

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
  tabActiva: 'directorio' | 'leads' = 'directorio';

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  
  leads: Lead[] = [];
  leadsPendientes: Lead[] = [];
  leadsContactados: Lead[] = [];
  leadsArchivados: Lead[] = [];

  mostrarModal = false;
  mostrarModalLead = false;
  isEditMode = false;
  isSaving = false;
  deletingId: number | null = null;
  
  clienteActual: Cliente = this.getEmptyCliente();

  // Filtros
  searchTerm = '';
  tipoFiltro = '';
  
  private leadService = inject(LeadService);
  leadActual: Lead = this.getEmptyLead();

  // Inicializa cargando clientes y leads
  ngOnInit() {
    this.cargarClientes();
    this.cargarLeads();
  }

  // Obtiene un objeto lead vacio
  getEmptyLead(): Lead {
    return {
      nombre: '',
      telefono: '',
      correo: '',
      horario_llamada: '',
      mensaje: '',
      estado: 'pendiente'
    };
  }

  // Obtiene un objeto cliente vacio
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

  // Formatea el ID del cliente para mostrar
  formatearId(id: number | undefined): string {
    if (!id) return 'CLI-000';
    return 'CLI' + id.toString().padStart(9, '0');
  }

  // Obtiene las iniciales del cliente
  obtenerIniciales(nombres: string, apellidos?: string): string {
    const n = nombres ? nombres.charAt(0).toUpperCase() : '';
    const a = apellidos ? apellidos.charAt(0).toUpperCase() : '';
    return n + a || 'CL';
  }

  // Carga los clientes del servidor
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

  // Filtra los clientes segun terminos de busqueda
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

  // Abre modal para crear cliente
  abrirModalNuevo() {
    this.isEditMode = false;
    this.clienteActual = this.getEmptyCliente();
    this.mostrarModal = true;
  }

  // Abre modal para editar cliente
  editarCliente(cliente: Cliente) {
    this.isEditMode = true;
    this.clienteActual = { ...cliente }; // Copia para no editar en vivo la tabla
    this.mostrarModal = true;
  }

  // Cierra el modal de clientes
  cerrarModal() {
    this.mostrarModal = false;
  }

  // Guarda o actualiza la informacion del cliente
  guardarCliente() {
    this.isSaving = true;
    const user = this.authService.getUser();
    const empresaId = user?.empresa_id || user?.empresa?.id || '';
    const headers = { 'X-Empresa-Id': empresaId.toString() };

    const onSuccess = () => {
      this.isSaving = false;
      this.toastService.show('Cliente guardado con éxito', 'success');
      this.cargarClientes();
      this.cerrarModal();

      // Si venía de un lead, archivarlo (ya fue formalizado)
      const leadId = (this.clienteActual as any)._leadSourceId;
      if (leadId) {
        this.leadService.actualizarLead(leadId, { estado: 'archivado' }).subscribe(() => {
          this.cargarLeads(); // Recargar leads para limpiar el kanban
        });
      }
    };

    if (this.isEditMode && this.clienteActual.id) {
      // PUT
      this.http.put('/api/clientes/' + this.clienteActual.id, this.clienteActual, { headers })
        .subscribe({
          next: onSuccess,
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
          next: onSuccess,
          error: (err) => {
            this.isSaving = false;
            console.error('Error creando cliente', err);
            const msg = err.error?.message || err.error?.error || err.message || 'Error al guardar el cliente';
            this.toastService.show(msg, 'error');
          }
        });
    }
  }

  // Elimina un cliente por su ID
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

  // --- LOGICA DE LEADS ---
  
  // Carga los leads y los organiza
  cargarLeads() {
    this.leadService.getLeads().subscribe({
      next: (data) => {
        this.leads = data;
        this.leadsPendientes = data.filter(l => l.estado === 'pendiente');
        this.leadsContactados = data.filter(l => l.estado === 'contactado');
        this.leadsArchivados = data.filter(l => l.estado === 'archivado');
      },
      error: (err) => {
        console.error('Error cargando leads', err);
      }
    });
  }

  // Actualiza el estado de un lead
  cambiarEstadoLead(lead: Lead, estado: string) {
    this.leadService.actualizarLead(lead.id!, { estado }).subscribe({
      next: () => {
        this.toastService.show(`Lead movido a ${estado}`, 'success');
        this.cargarLeads();
      },
      error: () => {
        this.toastService.show('Error al cambiar el estado del lead', 'error');
      }
    });
  }

  // Abre modal para nuevo lead
  abrirModalNuevoLead() {
    this.isEditMode = false;
    this.leadActual = this.getEmptyLead();
    this.mostrarModalLead = true;
  }

  // Abre modal para editar lead
  editarLead(lead: Lead) {
    this.isEditMode = true;
    this.leadActual = { ...lead };
    this.mostrarModalLead = true;
  }

  // Cierra modal de lead
  cerrarModalLead() {
    this.mostrarModalLead = false;
  }

  // Guarda la informacion del lead
  guardarLead() {
    this.isSaving = true;
    if (this.isEditMode && this.leadActual.id) {
      this.leadService.actualizarLead(this.leadActual.id, this.leadActual).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.show('Lead actualizado', 'success');
          this.cargarLeads();
          this.cerrarModalLead();
        },
        error: () => {
          this.isSaving = false;
          this.toastService.show('Error actualizando lead', 'error');
        }
      });
    } else {
      this.leadService.crearLead(this.leadActual).subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.show('Lead creado exitosamente', 'success');
          this.cargarLeads();
          this.cerrarModalLead();
        },
        error: () => {
          this.isSaving = false;
          this.toastService.show('Error creando lead', 'error');
        }
      });
    }
  }

  // Convierte un lead en cliente
  convertirLeadACliente(lead: Lead) {
    this.tabActiva = 'directorio';
    this.isEditMode = false;
    this.clienteActual = this.getEmptyCliente();
    
    // Mapear datos básicos
    this.clienteActual.nombres = lead.nombre;
    this.clienteActual.telefono = lead.telefono;
    this.clienteActual.email = lead.correo;
    this.clienteActual.comentarios = lead.mensaje;

    // Guardar el id del lead que estamos convirtiendo para archivarlo luego
    (this.clienteActual as any)._leadSourceId = lead.id;

    // Abrir modal de cliente para que lo termine de llenar
    this.mostrarModal = true;
    this.toastService.show('Por favor completa los datos para formalizar al cliente', 'info');
  }

  // Modificar guardarCliente para que si viene de un lead, lo archive
  // Lo haremos en el success de guardarCliente
}
