import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../../../../services/cliente.service';
import { OperariosTicketsService, ServicioTicket } from '../../../../../services/operarios-tickets.service';
import { ToastService } from '../../../../../services/toast.service';
import { SolicitudInactivacionComponent } from '../../../../../shared/components/solicitud-inactivacion/solicitud-inactivacion.component';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-crm-gestion-de-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, SolicitudInactivacionComponent],
  templateUrl: './crm-gestion-de-clientes.component.html',
  styleUrl: './crm-gestion-de-clientes.component.scss'
})
export class CrmGestionDeClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private ticketsService = inject(OperariosTicketsService);
  private toast = inject(ToastService);

  clientes: Cliente[] = [];
  resultados: Cliente[] = [];
  busqueda: string = '';
  buscando: boolean = false;
  clienteSeleccionado: Cliente | null = null;
  historialTickets: ServicioTicket[] = [];

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.clienteService.getClientes().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.clientes = res;
        this.resultados = res;
      },
      error: () => {
        this.clientes = [];
        this.resultados = [];
      }
    });
  }

  buscar() {
    this.buscando = true;
    const q = this.busqueda.trim().toLowerCase();
    if (!q) {
      this.resultados = this.clientes;
    } else {
      this.resultados = this.clientes.filter(c =>
        (c.nombres?.toLowerCase().includes(q)) ||
        (c.nombre_razon_social?.toLowerCase().includes(q)) ||
        (c.documento?.toLowerCase().includes(q))
      );
    }
    this.buscando = false;
  }

  seleccionarCliente(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.cargarHistorial(cliente);
  }

  cargarHistorial(cliente: Cliente) {
    this.ticketsService.getTickets().pipe(timeout(8000)).subscribe({
      next: (res) => {
        const nombre = (cliente.nombres + ' ' + (cliente.apellidos || '')).trim().toLowerCase();
        const razon = (cliente.nombre_razon_social || '').toLowerCase();
        this.historialTickets = res.filter(t =>
          t.cliente_nombre?.toLowerCase().includes(nombre) ||
          (razon && t.cliente_nombre?.toLowerCase().includes(razon))
        );
      },
      error: () => {
        this.historialTickets = [];
      }
    });
  }

  nombreCliente(cliente: Cliente): string {
    return cliente.nombre_razon_social || `${cliente.nombres} ${cliente.apellidos || ''}`.trim();
  }

  getBadgeEstado(estado: string): string {
    switch (estado) {
      case 'Finalizado': return 'badge-success';
      case 'Pendiente': return 'badge-warning';
      case 'Asignado': return 'badge-primary';
      case 'En Sitio': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  nuevaVisita() {
    this.toast.info('Crea un ticket de servicio desde el módulo de Servicios para registrar una nueva visita.');
  }
}