import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-soporte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-module-container fade-in">
      <header class="module-header">
        <div class="title-container">
          <svg class="header-icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3 3 0 01-4.242 0 3 3 0 010-4.242l3.278-3.278a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
          <div>
            <h1 class="header-title">SOPORTE TÉCNICO</h1>
            <p class="header-subtitle">Gestiona tus requerimientos y reportes de errores</p>
          </div>
        </div>
        <div class="actions-container">
          <button class="btn-primary" (click)="abrirModalCrear()">
            + Nuevo Ticket
          </button>
        </div>
      </header>

      <div class="glass-panel w-full">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asunto</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha de Creación</th>
                <th class="text-center">Respuesta</th>
              </tr>
            </thead>
            <tbody>
              @for (ticket of tickets; track ticket.id) {
                <tr>
                  <td>#{{ ticket.id }}</td>
                  <td class="font-medium text-white">{{ ticket.asunto }}</td>
                  <td>
                    <span class="badge"
                          [class.badge-red]="ticket.prioridad === 'Alta'"
                          [class.badge-yellow]="ticket.prioridad === 'Media'"
                          [class.badge-green]="ticket.prioridad === 'Baja'">
                      {{ ticket.prioridad }}
                    </span>
                  </td>
                  <td>
                    <span class="badge"
                          [class.badge-orange]="ticket.estado === 'Abierto'"
                          [class.badge-blue]="ticket.estado === 'En progreso'"
                          [class.badge-emerald]="ticket.estado === 'Resuelto'">
                      {{ ticket.estado }}
                    </span>
                  </td>
                  <td class="text-gray-400 text-sm">{{ ticket.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="text-center">
                    @if (ticket.estado === 'Resuelto' && ticket.notas_resolucion) {
                      <button (click)="verRespuesta(ticket)" class="btn-icon" title="Ver Respuesta">
                        <svg class="w-5 h-5 text-emerald-400 hover:text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    } @else {
                      <span class="text-gray-500 text-sm">-</span>
                    }
                  </td>
                </tr>
              }
              @if (tickets.length === 0) {
                <tr>
                  <td colspan="6" class="text-center text-gray-500 p-8">
                    No tienes tickets de soporte registrados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL CREAR TICKET -->
    @if (showModalCrear) {
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="text-2xl font-bold text-white uppercase">Crear Ticket de Soporte</h2>
            <button class="btn-close" (click)="cerrarModalCrear()">×</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="crearTicket()">
              <div class="form-group">
                <label>Asunto</label>
                <input type="text" [(ngModel)]="nuevoTicket.asunto" name="asunto" class="form-control" required placeholder="Ej. Problema con el módulo de ventas">
              </div>
              <div class="form-group">
                <label>Prioridad</label>
                <select [(ngModel)]="nuevoTicket.prioridad" name="prioridad" class="form-control" required>
                  <option value="Baja">Baja (Consultas generales)</option>
                  <option value="Media">Media (Errores que no impiden trabajar)</option>
                  <option value="Alta">Alta (Errores críticos que detienen el sistema)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Descripción detallada</label>
                <textarea [(ngModel)]="nuevoTicket.mensaje" name="mensaje" class="form-control min-h-[120px]" required placeholder="Explica detalladamente el problema, incluyendo pasos para reproducirlo..."></textarea>
              </div>
              
              <div class="flex justify-center gap-4 mt-6">
                <button type="button" class="btn-danger w-32 justify-center" (click)="cerrarModalCrear()">Volver</button>
                <button type="submit" class="btn-success w-32 justify-center" [disabled]="isGuardando">
                  @if (isGuardando) {
                    <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  } @else {
                    Enviar
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- MODAL VER RESPUESTA -->
    @if (ticketSeleccionadoParaRespuesta) {
      <div class="modal-overlay">
        <div class="modal-content max-w-lg">
          <div class="modal-header">
            <h2 class="text-2xl font-bold text-white uppercase">Respuesta del Soporte</h2>
            <button class="btn-close" (click)="ticketSeleccionadoParaRespuesta = null">×</button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <p class="text-gray-400 text-sm mb-1">Tu consulta:</p>
              <p class="text-gray-200 font-medium bg-gray-800/50 p-3 rounded">{{ ticketSeleccionadoParaRespuesta.mensaje }}</p>
            </div>
            <div>
              <p class="text-emerald-400 text-sm mb-1 font-semibold">Respuesta del Equipo Técnico:</p>
              <p class="text-white bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg min-h-[100px]">{{ ticketSeleccionadoParaRespuesta.notas_resolucion }}</p>
            </div>
            <div class="flex justify-center mt-6">
              <button class="btn-danger w-32 justify-center" (click)="ticketSeleccionadoParaRespuesta = null">Volver</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-red { background: rgba(239, 68, 68, 0.2); color: rgb(248, 113, 113); border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-yellow { background: rgba(234, 179, 8, 0.2); color: rgb(250, 204, 21); border: 1px solid rgba(234, 179, 8, 0.3); }
    .badge-green { background: rgba(34, 197, 94, 0.2); color: rgb(74, 222, 128); border: 1px solid rgba(34, 197, 94, 0.3); }
    
    .badge-orange { background: rgba(249, 115, 22, 0.2); color: rgb(251, 146, 60); border: 1px solid rgba(249, 115, 22, 0.3); }
    .badge-blue { background: rgba(59, 130, 246, 0.2); color: rgb(96, 165, 250); border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-emerald { background: rgba(16, 185, 129, 0.2); color: rgb(52, 211, 153); border: 1px solid rgba(16, 185, 129, 0.3); }
  `]
})
export class SoporteComponent implements OnInit {
  tickets: any[] = [];
  showModalCrear = false;
  isGuardando = false;
  
  nuevoTicket = {
    asunto: '',
    mensaje: '',
    prioridad: 'Media'
  };

  ticketSeleccionadoParaRespuesta: any = null;

  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.cargarTickets();
  }

  cargarTickets() {
    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>('/api/soporte', { headers }).subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al cargar los tickets de soporte');
      }
    });
  }

  abrirModalCrear() {
    this.nuevoTicket = { asunto: '', mensaje: '', prioridad: 'Media' };
    this.showModalCrear = true;
  }

  cerrarModalCrear() {
    this.showModalCrear = false;
  }

  crearTicket() {
    if (!this.nuevoTicket.asunto || !this.nuevoTicket.mensaje) {
      this.toastService.warning('Completa todos los campos obligatorios');
      return;
    }

    this.isGuardando = true;
    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post('/api/soporte', this.nuevoTicket, { headers }).subscribe({
      next: () => {
        this.toastService.success('Ticket creado con éxito. Nuestro equipo lo revisará pronto.');
        this.isGuardando = false;
        this.cerrarModalCrear();
        this.cargarTickets();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Error al crear el ticket');
        this.isGuardando = false;
      }
    });
  }

  verRespuesta(ticket: any) {
    this.ticketSeleccionadoParaRespuesta = ticket;
  }
}
