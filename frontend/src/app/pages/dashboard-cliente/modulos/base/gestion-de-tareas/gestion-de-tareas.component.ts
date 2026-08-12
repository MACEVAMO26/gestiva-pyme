import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareaService, Tarea } from '../../../../../services/tarea.service';
import { EmpleadoService } from '../../../../../services/empleado.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-gestion-de-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-de-tareas.component.html',
  styleUrl: './gestion-de-tareas.component.scss'
})
export class GestionDeTareasComponent implements OnInit {
  private tareaService = inject(TareaService);
  private empleadoService = inject(EmpleadoService);
  private toast = inject(ToastService);

  tareas: Tarea[] = [];
  empleados: any[] = [];
  cargando = false;
  guardando = false;

  // Formulario
  nuevaTarea: Tarea = {
    titulo: '',
    descripcion: '',
    asignado_id: 0
  };

  ngOnInit(): void {
    this.cargarTareas();
    this.cargarEmpleados();
  }

  cargarTareas() {
    this.cargando = true;
    this.tareaService.getTareas().subscribe({
      next: (res) => {
        this.tareas = res;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.toast.error('Error al cargar tareas');
      }
    });
  }

  cargarEmpleados() {
    this.empleadoService.getEmpleados().subscribe({
      next: (res) => {
        this.empleados = res;
      },
      error: () => {
        // Fallo silencioso o toast
      }
    });
  }

  crearTarea() {
    if (!this.nuevaTarea.titulo || !this.nuevaTarea.asignado_id) {
      this.toast.warning('Complete los campos obligatorios (Título y Asignado)');
      return;
    }

    this.guardando = true;
    this.tareaService.crearTarea(this.nuevaTarea).subscribe({
      next: (res) => {
        this.guardando = false;
        this.toast.success('Tarea asignada con éxito');
        this.cargarTareas();
        this.nuevaTarea = { titulo: '', descripcion: '', asignado_id: 0 };
      },
      error: (err) => {
        this.guardando = false;
        this.toast.error('No se pudo guardar la tarea');
      }
    });
  }

  actualizarEstado(id: number | undefined, nuevoEstado: string) {
    if (!id) return;
    this.tareaService.actualizarEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.toast.success('Estado actualizado');
        this.cargarTareas();
      },
      error: () => {
        this.toast.error('Error al actualizar estado');
      }
    });
  }
}
