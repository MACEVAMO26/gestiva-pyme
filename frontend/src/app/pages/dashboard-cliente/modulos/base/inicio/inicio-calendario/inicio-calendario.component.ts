import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgendaService, EventoCalendario } from '../../../../../../services/agenda.service';
import { ToastService } from '../../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-inicio-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio-calendario.component.html',
  styleUrl: './inicio-calendario.component.scss'
})
export class InicioCalendarioComponent implements OnInit {
  private agendaService = inject(AgendaService);
  private toast = inject(ToastService);

  isModalOpen = false;
  mesActual = new Date();
  diasDelMes: {dia: number, hoy: boolean, evento: boolean, eventos: EventoCalendario[]}[] = [];
  diasVacios: number[] = [];
  nombreMes = '';

  diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  eventoForm = {
    titulo: '',
    descripcion: '',
    fecha: ''
  };

  ngOnInit() {
    this.generarCalendario();
  }

  cargarEventos() {
    this.agendaService.getEventos().pipe(timeout(8000)).subscribe({
      next: (eventos) => {
        this.generarCalendario(eventos);
      },
      error: () => {
        this.generarCalendario([]);
      }
    });
  }

  // Genera la grilla de días del mes actual
  generarCalendario(eventos: EventoCalendario[] = []) {
    const anio = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.nombreMes = `${meses[mes]} ${anio}`;

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const totalDias = ultimoDia.getDate();

    let diaInicio = primerDia.getDay() - 1;
    if (diaInicio < 0) diaInicio = 6;

    this.diasVacios = Array(diaInicio).fill(0);

    const hoy = new Date();
    this.diasDelMes = [];
    for (let d = 1; d <= totalDias; d++) {
      const fechaISO = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const delDia = eventos.filter(ev => {
        const inicio = (ev.fecha_inicio || '').substring(0, 10);
        return inicio === fechaISO;
      });
      this.diasDelMes.push({
        dia: d,
        hoy: (d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()),
        evento: delDia.length > 0,
        eventos: delDia
      });
    }
  }

  // Navegar al mes anterior
  mesAnterior() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.cargarEventos();
  }

  // Navegar al mes siguiente
  mesSiguiente() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
    this.cargarEventos();
  }

  abrirModal() {
    const hoy = new Date();
    this.eventoForm = {
      titulo: '',
      descripcion: '',
      fecha: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
    };
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  guardarEvento() {
    if (!this.eventoForm.titulo || !this.eventoForm.fecha) {
      this.toast.warning('Complete el título y la fecha');
      return;
    }
    const evento: EventoCalendario = {
      titulo: this.eventoForm.titulo,
      descripcion: this.eventoForm.descripcion || undefined,
      fecha_inicio: this.eventoForm.fecha,
      fecha_fin: this.eventoForm.fecha,
      color_etiqueta: '#45a1ae'
    };
    this.agendaService.crearEvento(evento).pipe(timeout(8000)).subscribe({
      next: () => {
        this.toast.success('Evento creado correctamente');
        this.cerrarModal();
        this.cargarEventos();
      },
      error: () => {
        this.toast.error('Error al crear el evento');
      }
    });
  }
}