import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService, EventoCalendario } from '../../../../../services/agenda.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-agenda-y-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda-y-calendario.component.html',
  styleUrl: './agenda-y-calendario.component.scss'
})
export class AgendaYCalendarioComponent implements OnInit {
  private agendaService = inject(AgendaService);
  private toast = inject(ToastService);

  eventos: EventoCalendario[] = [];
  cargando = false;
  guardando = false;

  nuevoEvento: EventoCalendario = {
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    color_etiqueta: '#45a1ae'
  };

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {
    this.cargando = true;
    this.agendaService.getEventos().subscribe({
      next: (res) => {
        this.eventos = res;
        this.cargando = false;
      },
      error: () => {
        this.toast.error('Error al cargar la agenda');
        this.cargando = false;
      }
    });
  }

  guardarEvento() {
    if (!this.nuevoEvento.titulo || !this.nuevoEvento.fecha_inicio || !this.nuevoEvento.fecha_fin) {
      return this.toast.warning('Título, fecha de inicio y fin son obligatorios');
    }

    this.guardando = true;
    this.agendaService.crearEvento(this.nuevoEvento).subscribe({
      next: () => {
        this.toast.success('Evento agendado con éxito');
        this.nuevoEvento = { titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', color_etiqueta: '#45a1ae' };
        this.cargarEventos();
        this.guardando = false;
      },
      error: () => {
        this.toast.error('Error al guardar el evento');
        this.guardando = false;
      }
    });
  }
}
