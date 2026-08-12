import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReunionService, Reunion } from '../../../../../services/reunion.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-agenda-y-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda-y-calendario.component.html',
  styleUrl: './agenda-y-calendario.component.scss'
})
export class AgendaYCalendarioComponent implements OnInit {
  private reunionService = inject(ReunionService);
  private toast = inject(ToastService);

  reuniones: Reunion[] = [];
  cargando = false;
  guardando = false;

  nuevaReunion: Reunion = {
    titulo: '',
    descripcion: '',
    fecha_hora: '',
    tipo_encuentro: 'virtual',
    audiencia: 'todos',
    enlace_lugar: ''
  };

  ngOnInit(): void {
    this.cargarReuniones();
  }

  cargarReuniones() {
    this.cargando = true;
    this.reunionService.getReuniones().subscribe({
      next: (res) => {
        this.reuniones = res;
        this.cargando = false;
      },
      error: () => {
        this.toast.error('Error al cargar agenda');
        this.cargando = false;
      }
    });
  }

  crearReunion() {
    if (!this.nuevaReunion.titulo || !this.nuevaReunion.fecha_hora) {
      this.toast.warning('Complete título y fecha/hora');
      return;
    }

    this.guardando = true;
    this.reunionService.crearReunion(this.nuevaReunion).subscribe({
      next: () => {
        this.toast.success('Reunión agendada correctamente');
        this.guardando = false;
        this.cargarReuniones();
        this.nuevaReunion = {
          titulo: '',
          descripcion: '',
          fecha_hora: '',
          tipo_encuentro: 'virtual',
          audiencia: 'todos',
          enlace_lugar: ''
        };
      },
      error: () => {
        this.toast.error('Error al agendar reunión');
        this.guardando = false;
      }
    });
  }
}
