import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TareaService, Tarea } from '../../services/tarea.service';
import { ReunionService, Reunion } from '../../services/reunion.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
})
export class DashboardHome implements OnInit, OnDestroy {
  authService = inject(AuthService);
  tareaService = inject(TareaService);
  reunionService = inject(ReunionService);
  http = inject(HttpClient);

  currentUser: any;
  puedeAsignar = false;

  tareasRecibidas: Tarea[] = [];
  tareasAsignadas: Tarea[] = [];
  empleados: any[] = [];
  
  reuniones: Reunion[] = [];

  isLoading = false;
  tabActiva: 'recibidas' | 'asignadas' = 'recibidas';

  // Modal Crear Tarea
  showModal = false;
  isSubmitting = false;
  nuevaTarea = {
    titulo: '',
    descripcion: '',
    asignado_id: ''
  };

  // Modal Crear Reunión
  showReunionModal = false;
  isSubmittingReunion = false;
  nuevaReunion = {
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    tipo_encuentro: 'virtual',
    audiencia: 'todos',
    enlace_lugar: ''
  };

  // Calendario Dinámico y Reloj
  currentDate = new Date();
  currentTime = new Date();
  clockInterval: any;
  monthName = '';
  calendarDays: any[] = [];

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    const rol = this.currentUser?.rol?.nombre;
    this.puedeAsignar = (rol === 'Gerente' || rol === 'Jefe de Área');
    
    this.iniciarReloj();
    this.generarCalendario();
    this.cargarTareas();
    this.cargarReuniones();
    
    if (this.puedeAsignar) {
      this.cargarEmpleados();
    }
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  iniciarReloj() {
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  generarCalendario() {
    const today = new Date();
    // Mes actual (Ej. 'Enero' -> primera letra mayúscula)
    let mName = today.toLocaleString('es-ES', { month: 'long' });
    this.monthName = mName.charAt(0).toUpperCase() + mName.slice(1);

    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay(); // 0 es Domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    this.calendarDays = [];

    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      this.calendarDays.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        dateObj: new Date(year, month - 1, daysInPrevMonth - i)
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === today.getDate(),
        dateObj: new Date(year, month, i)
      });
    }

    // Rellenar hasta completar la cuadrícula (35 o 42)
    const totalCells = this.calendarDays.length > 35 ? 42 : 35;
    const remaining = totalCells - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      this.calendarDays.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        dateObj: new Date(year, month + 1, i)
      });
    }
  }

  actualizarPuntosCalendario() {
    const colores = ['teal', 'blue', 'orange', 'purple'];
    
    // Limpiamos puntos
    this.calendarDays.forEach(d => d.dotColor = null);

    // Asignamos un color de punto a los días que tengan reuniones
    this.reuniones.forEach(reu => {
      const rDate = new Date(reu.fecha_hora);
      const rDay = rDate.getDate();
      const rMonth = rDate.getMonth();
      const rYear = rDate.getFullYear();

      const calDay = this.calendarDays.find(d => 
        d.dateObj.getDate() === rDay && 
        d.dateObj.getMonth() === rMonth && 
        d.dateObj.getFullYear() === rYear
      );

      if (calDay && !calDay.dotColor) {
        // Asignamos un color aleatorio de la paleta del mockup para que se vea colorido
        calDay.dotColor = colores[Math.floor(Math.random() * colores.length)];
      }
    });
  }

  cargarReuniones() {
    this.reunionService.getReuniones().subscribe({
      next: (data) => {
        this.reuniones = data;
        this.actualizarPuntosCalendario();
      },
      error: (err) => console.error('Error cargando reuniones', err)
    });
  }

  cargarTareas() {
    this.isLoading = true;
    this.tareaService.getTareas().subscribe({
      next: (data: any) => {
        // La API devolverá un arreglo con todas las tareas relacionadas al usuario
        // Las separamos en frontend o si la API ya las envía separadas, lo ajustamos.
        // Asumamos que envía { recibidas: [], asignadas: [] }
        if (data.recibidas || data.asignadas) {
            this.tareasRecibidas = data.recibidas || [];
            this.tareasAsignadas = data.asignadas || [];
        } else {
            // Fallback si la api manda un array plano
            const myId = this.currentUser.id;
            this.tareasRecibidas = data.filter((t: Tarea) => t.asignado_id == myId);
            this.tareasAsignadas = data.filter((t: Tarea) => t.asignador_id == myId);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar tareas', err);
        this.isLoading = false;
      }
    });
  }

  cargarEmpleados() {
    const token = sessionStorage.getItem('auth_token');
    this.http.get<any[]>('/api/usuarios', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        // Filtramos a nosotros mismos si queremos, o dejamos a todos
        this.empleados = data.filter(u => u.id !== this.currentUser.id);
      },
      error: (err) => console.error('Error cargando empleados:', err)
    });
  }

  abrirModalTarea() {
    this.nuevaTarea = {
      titulo: '',
      descripcion: '',
      asignado_id: this.puedeAsignar ? '' : this.currentUser?.id
    };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  crearTarea() {
    if (!this.nuevaTarea.titulo || !this.nuevaTarea.asignado_id) return;
    this.isSubmitting = true;
    this.tareaService.crearTarea(this.nuevaTarea).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.cerrarModal();
        this.cargarTareas();
      },
      error: (err) => {
        console.error('Error creando tarea', err);
        this.isSubmitting = false;
        alert('Hubo un error al crear la tarea');
      }
    });
  }

  cambiarEstado(tarea: Tarea, nuevoEstado: string) {
    if (!tarea.id) return;
    this.tareaService.actualizarEstado(tarea.id, nuevoEstado).subscribe({
      next: () => {
        this.cargarTareas();
      },
      error: (err) => {
        console.error('Error actualizando tarea', err);
        alert('Error al actualizar el estado.');
      }
    });
  }

  abrirModalReunion() {
    this.nuevaReunion = {
      titulo: '',
      descripcion: '',
      fecha: '',
      hora: '',
      tipo_encuentro: 'virtual',
      audiencia: 'todos',
      enlace_lugar: ''
    };
    this.showReunionModal = true;
  }

  cerrarModalReunion() {
    this.showReunionModal = false;
  }

  crearReunion() {
    if (!this.nuevaReunion.titulo || !this.nuevaReunion.fecha || !this.nuevaReunion.hora) return;
    
    const payload = {
      ...this.nuevaReunion,
      fecha_hora: `${this.nuevaReunion.fecha} ${this.nuevaReunion.hora}:00`
    };

    this.isSubmittingReunion = true;
    this.reunionService.crearReunion(payload).subscribe({
      next: () => {
        this.isSubmittingReunion = false;
        this.cerrarModalReunion();
        this.cargarReuniones();
      },
      error: (err) => {
        console.error('Error creando reunión', err);
        this.isSubmittingReunion = false;
        alert('Hubo un error al agendar la reunión');
      }
    });
  }
}
