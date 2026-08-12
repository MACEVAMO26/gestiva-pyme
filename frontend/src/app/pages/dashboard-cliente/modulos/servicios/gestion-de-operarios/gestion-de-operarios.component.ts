import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperariosTicketsService, ServicioTicket } from '../../../../../services/operarios-tickets.service';
import { ToastService } from '../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-gestion-de-operarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-de-operarios.component.html',
  styleUrl: './gestion-de-operarios.component.scss'
})
export class GestionDeOperariosComponent implements OnInit {
  private ticketsService = inject(OperariosTicketsService);
  private toast = inject(ToastService);

  tickets: ServicioTicket[] = [];
  cargando = false;
  guardando = false;

  nuevoTicket: ServicioTicket = {
    cliente_nombre: '',
    servicio_requerido: '',
    estado: 'Pendiente'
  };

  ngOnInit() {
    this.cargarTickets();
  }

  cargarTickets() {
    this.cargando = true;
    this.ticketsService.getTickets().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.tickets = res;
        this.cargando = false;
      },
      error: () => {
        this.tickets = [];
        this.toast.error('Error al cargar tickets');
        this.cargando = false;
      }
    });
  }

  crearTicket() {
    if (!this.nuevoTicket.cliente_nombre || !this.nuevoTicket.servicio_requerido) {
      return this.toast.warning('Cliente y Servicio son obligatorios');
    }

    this.guardando = true;
    this.ticketsService.crearTicket(this.nuevoTicket).pipe(timeout(8000)).subscribe({
      next: () => {
        this.toast.success('Ticket creado con éxito');
        this.nuevoTicket = { cliente_nombre: '', servicio_requerido: '', estado: 'Pendiente' };
        this.cargarTickets();
        this.guardando = false;
      },
      error: () => {
        this.toast.error('Error al crear ticket');
        this.guardando = false;
      }
    });
  }
}
