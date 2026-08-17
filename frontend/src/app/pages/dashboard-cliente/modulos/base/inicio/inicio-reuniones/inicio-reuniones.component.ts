import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReunionService, Reunion } from '../../../../../../services/reunion.service';
import { ToastService } from '../../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-inicio-reuniones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio-reuniones.component.html',
  styleUrl: './inicio-reuniones.component.scss'
})
export class InicioReunionesComponent implements OnInit {
  private reunionService = inject(ReunionService);
  private toast = inject(ToastService);

  reuniones: Reunion[] = [];
  cargando: boolean = false;
  showModal: boolean = false;
  guardando: boolean = false;

  formReunion = {
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '09:00',
    tipo_encuentro: 'virtual' as 'virtual' | 'presencial',
    audiencia: 'todos' as 'todos' | 'area' | 'gerencia',
    enlace_lugar: ''
  };

  ngOnInit() {
    this.cargarReuniones();
  }

  cargarReuniones() {
    this.cargando = true;
    this.reunionService.getReuniones().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.reuniones = res;
        this.cargando = false;
      },
      error: () => {
        this.reuniones = [];
        this.cargando = false;
      }
    });
  }

  abrirModal() {
    this.formReunion = {
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '09:00',
      tipo_encuentro: 'virtual',
      audiencia: 'todos',
      enlace_lugar: ''
    };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardarReunion() {
    if (!this.formReunion.titulo || !this.formReunion.fecha) {
      this.toast.warning('Complete el título y la fecha');
      return;
    }
    this.guardando = true;
    const reunion: any = {
      titulo: this.formReunion.titulo,
      descripcion: this.formReunion.descripcion || undefined,
      fecha_hora: `${this.formReunion.fecha}T${this.formReunion.hora}:00`,
      tipo_encuentro: this.formReunion.tipo_encuentro,
      audiencia: this.formReunion.audiencia,
      enlace_lugar: this.formReunion.enlace_lugar || undefined
    };
    this.reunionService.crearReunion(reunion).pipe(timeout(8000)).subscribe({
      next: () => {
        this.toast.success('Reunión creada y notificada a los participantes');
        this.guardando = false;
        this.cerrarModal();
        this.cargarReuniones();
      },
      error: (err) => {
        this.guardando = false;
        this.toast.error(err.error?.message || 'Error al crear la reunión');
      }
    });
  }

  diaReunion(r: Reunion): string {
    return r.fecha_hora ? String(new Date(r.fecha_hora).getDate()) : '';
  }

  mesReunion(r: Reunion): string {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return r.fecha_hora ? meses[new Date(r.fecha_hora).getMonth()] : '';
  }

  horaReunion(r: Reunion): string {
    if (!r.fecha_hora) return '';
    const d = new Date(r.fecha_hora);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  organizadorReunion(r: any): string {
    if (r.organizador?.nombres) return `${r.organizador.nombres} ${r.organizador.apellidos || ''}`;
    return 'Tú';
  }
}