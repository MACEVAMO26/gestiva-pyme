import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareaService, Tarea } from '../../../../../services/tarea.service';
import { UsuariosService } from '../../../../../services/usuarios.service';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-gestion-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-tareas.html',
  styleUrl: './gestion-tareas.scss',
})
export class GestionTareas implements OnInit {
  private tareaService = inject(TareaService);
  private usuariosService = inject(UsuariosService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  tareas: Tarea[] = [];
  usuarios: any[] = [];
  cargando = false;
  guardando = false;
  showModal = false;

  formTarea = {
    titulo: '',
    descripcion: '',
    asignado_id: 0
  };

  ngOnInit() {
    this.cargarTareas();
    this.cargarUsuarios();
  }

  cargarTareas() {
    this.cargando = true;
    this.tareaService.getTareas().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.tareas = res;
        this.cargando = false;
      },
      error: () => {
        this.tareas = [];
        this.cargando = false;
      }
    });
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.usuarios = res;
      },
      error: () => {
        this.usuarios = [];
      }
    });
  }

  esGerencia(): boolean {
    const user = this.authService.getUser();
    const rol = user?.rol?.nombre || '';
    return ['Gerente General', 'Jefe de Área'].includes(rol);
  }

  abrirModal() {
    this.formTarea = {
      titulo: '',
      descripcion: '',
      asignado_id: 0
    };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardarTarea() {
    if (!this.formTarea.titulo) {
      this.toast.warning('Escriba un título para la tarea');
      return;
    }
    this.guardando = true;
    const payload: any = {
      titulo: this.formTarea.titulo,
      descripcion: this.formTarea.descripcion || undefined
    };
    if (this.esGerencia() && this.formTarea.asignado_id) {
      payload.asignado_id = this.formTarea.asignado_id;
    } else {
      payload.asignado_id = this.authService.getUser()?.id;
    }

    this.tareaService.crearTarea(payload).pipe(timeout(8000)).subscribe({
      next: () => {
        this.toast.success('Tarea creada correctamente');
        this.guardando = false;
        this.cerrarModal();
        this.cargarTareas();
      },
      error: (err) => {
        this.guardando = false;
        this.toast.error(err.error?.message || 'No se pudo crear la tarea');
      }
    });
  }

  cambiarEstado(tarea: Tarea, estado: string) {
    if (!tarea.id) return;
    this.tareaService.actualizarEstado(tarea.id, estado).pipe(timeout(8000)).subscribe({
      next: () => {
        this.toast.success('Estado actualizado');
        this.cargarTareas();
      },
      error: () => {
        this.toast.error('No se pudo actualizar el estado');
      }
    });
  }

  nombreAsignado(tarea: Tarea): string {
    const a = tarea.asignado;
    if (a?.primer_nombre) return [a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido].filter(Boolean).join(' ');
    return '—';
  }

  nombreAsignador(tarea: Tarea): string {
    const a = tarea.asignador;
    if (a?.primer_nombre) return [a.primer_nombre, a.segundo_nombre, a.primer_apellido, a.segundo_apellido].filter(Boolean).join(' ');
    return '—';
  }

  estadoTexto(estado?: string): string {
    switch (estado) {
      case 'vista': return 'Vista';
      case 'en_proceso': return 'En Proceso';
      case 'con_dificultades': return 'Con Dificultades';
      case 'terminada': return 'Terminada';
      default: return 'Notificada';
    }
  }
}