import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesService, Notificacion } from '../../../../../../services/notificaciones.service';
import { ToastService } from '../../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-inicio-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-notificaciones.component.html',
  styleUrl: './inicio-notificaciones.component.scss'
})
export class InicioNotificacionesComponent implements OnInit {
  private notifService = inject(NotificacionesService);
  private toast = inject(ToastService);

  notificaciones: Notificacion[] = [];
  cargando = false;

  ngOnInit() {
    this.cargarNotificaciones();
  }

  cargarNotificaciones() {
    this.cargando = true;
    this.notifService.getNotificaciones().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.notificaciones = res;
        this.cargando = false;
      },
      error: () => {
        this.notificaciones = [];
        this.cargando = false;
      }
    });
  }

  marcarLeida(id: number | undefined) {
    if (!id) return;
    this.notifService.marcarLeida(id).subscribe({
      next: () => this.cargarNotificaciones(),
      error: () => this.toast.error('Error al actualizar notificación')
    });
  }
}
