import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecordatoriosService, Recordatorio } from '../../../../../../services/recordatorios.service';
import { ToastService } from '../../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-inicio-recordatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio-recordatorios.component.html',
  styleUrl: './inicio-recordatorios.component.scss'
})
export class InicioRecordatoriosComponent implements OnInit {
  private recordatoriosService = inject(RecordatoriosService);
  private toast = inject(ToastService);

  recordatorios: Recordatorio[] = [];
  nuevoTitulo = '';
  nuevaDescripcion = '';
  guardando = false;
  cargando = false;

  ngOnInit() {
    this.cargarRecordatorios();
  }

  cargarRecordatorios() {
    this.cargando = true;
    this.recordatoriosService.getRecordatorios().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.recordatorios = res;
        this.cargando = false;
      },
      error: () => {
        this.recordatorios = [];
        this.cargando = false;
      }
    });
  }

  agregar() {
    if (!this.nuevoTitulo) return;
    this.guardando = true;
    
    const payload = {
      titulo: this.nuevoTitulo,
      descripcion: this.nuevaDescripcion,
      completado: false
    };

    this.recordatoriosService.agregarRecordatorio(payload).subscribe({
      next: () => {
        this.nuevoTitulo = '';
        this.nuevaDescripcion = '';
        this.guardando = false;
        this.cargarRecordatorios();
      },
      error: () => {
        this.guardando = false;
        this.toast.error('No se pudo guardar el recordatorio');
      }
    });
  }

  marcar(id: number | undefined, completado: boolean) {
    if (!id) return;
    this.recordatoriosService.marcarCompletado(id, completado).subscribe({
      next: () => this.cargarRecordatorios(),
      error: () => this.toast.error('Error al actualizar recordatorio')
    });
  }

  eliminar(id: number | undefined) {
    if (!id) return;
    this.recordatoriosService.eliminarRecordatorio(id).subscribe({
      next: () => this.cargarRecordatorios(),
      error: () => this.toast.error('Error al eliminar recordatorio')
    });
  }
}
