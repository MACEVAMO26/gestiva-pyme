import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiempoService } from '../../../services/tiempo.service';
import { EmpleadoService } from '../../../services/empleado.service';

@Component({
  selector: 'app-tiempo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tiempo.html',
  styleUrl: './tiempo.scss'
})
export class TiempoComponent implements OnInit {
  // Servicios
  private tiempoService = inject(TiempoService);
  private empleadoService = inject(EmpleadoService);

  // --- VARIABLES DE ESTADO ---
  currentTab = 'turnos';
  turnos: any[] = [];
  empleados: any[] = [];
  vacaciones: any[] = [];

  // Formularios
  nuevoTurno = {
    nombre_turno: '',
    hora_entrada: '',
    hora_salida: '',
    dias_semana: ''
  };

  asignacion = {
    usuario_id: null,
    turno_id: null,
    fecha_desde: '',
    fecha_hasta: ''
  };

  // UI
  isSubmittingTurno = false;
  isSubmittingAsignacion = false;
  isSubmittingRespuesta = false;

  // Variables para Modal de Respuesta Vacaciones
  showModalVacaciones = false;
  vacacionSeleccionada: any = null;
  respuestaVacacion = {
    estado: 'aprobada',
    justificacion_respuesta: ''
  };

  // Inicializar componente
  ngOnInit() {
    this.cargarDatosTab();
  }

  // Cambiar pestaña activa
  setTab(tab: string) {
    this.currentTab = tab;
    this.cargarDatosTab();
  }

  // Cargar datos según la pestaña activa
  cargarDatosTab() {
    if (this.currentTab === 'turnos') {
      this.cargarTurnos();
    } else if (this.currentTab === 'asignacion') {
      this.cargarTurnos();
      this.cargarEmpleados();
    } else if (this.currentTab === 'vacaciones') {
      this.cargarVacaciones();
    }
  }

  // --- MÉTODOS TURNOS ---
  // Obtener lista de turnos
  cargarTurnos() {
    this.tiempoService.getTurnos().subscribe({
      next: (data) => this.turnos = data,
      error: (err) => console.error('Error cargando turnos', err)
    });
  }

  // Crear un nuevo turno
  crearTurno() {
    if (!this.nuevoTurno.nombre_turno || !this.nuevoTurno.hora_entrada || !this.nuevoTurno.hora_salida) {
      alert('Por favor completa todos los campos del turno.');
      return;
    }
    
    this.isSubmittingTurno = true;
    this.tiempoService.crearTurno(this.nuevoTurno).subscribe({
      next: (res) => {
        this.isSubmittingTurno = false;
        alert('Turno creado correctamente.');
        this.nuevoTurno = { nombre_turno: '', hora_entrada: '', hora_salida: '', dias_semana: '' };
        this.cargarTurnos();
      },
      error: (err) => {
        this.isSubmittingTurno = false;
        console.error(err);
        alert('Error al crear el turno.');
      }
    });
  }

  // Cambiar estado activo/inactivo del turno
  toggleTurnoEstado(turno: any) {
    const nuevoEstado = !turno.activo;
    this.tiempoService.cambiarEstadoTurno(turno.id, nuevoEstado).subscribe({
      next: (res) => {
        turno.activo = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al cambiar estado del turno', err);
        alert('Error al cambiar el estado del turno.');
      }
    });
  }

  // --- MÉTODOS ASIGNACIÓN ---
  // Obtener lista de empleados activos
  cargarEmpleados() {
    this.empleadoService.getEmpleados().subscribe({
      next: (data) => {
        // Solo mostramos empleados activos para asignarles turno
        this.empleados = data.filter((e: any) => e.estado === 'activo');
      },
      error: (err) => console.error('Error cargando empleados', err)
    });
  }

  // Asignar turno a un empleado
  asignarTurno() {
    if (!this.asignacion.usuario_id || !this.asignacion.turno_id || !this.asignacion.fecha_desde || !this.asignacion.fecha_hasta) {
      alert('Por favor completa todos los campos de asignación.');
      return;
    }

    this.isSubmittingAsignacion = true;
    this.tiempoService.asignarTurno(this.asignacion.turno_id, this.asignacion).subscribe({
      next: (res) => {
        this.isSubmittingAsignacion = false;
        alert(res.message);
        this.asignacion = { usuario_id: null, turno_id: null, fecha_desde: '', fecha_hasta: '' };
      },
      error: (err) => {
        this.isSubmittingAsignacion = false;
        console.error(err);
        if (err.status === 422 && err.error.message) {
          alert(err.error.message); // Muestra error si se cruza con vacaciones
        } else {
          alert('Error al asignar el turno.');
        }
      }
    });
  }

  // --- MÉTODOS VACACIONES (RRHH) ---
  // Cargar solicitudes de vacaciones
  cargarVacaciones() {
    this.tiempoService.getVacaciones().subscribe({
      next: (data) => this.vacaciones = data,
      error: (err) => console.error('Error cargando vacaciones', err)
    });
  }

  // Abrir modal de gestión de vacaciones
  abrirModalVacaciones(vacacion: any) {
    this.vacacionSeleccionada = vacacion;
    this.respuestaVacacion = {
      estado: 'aprobada',
      justificacion_respuesta: ''
    };
    this.showModalVacaciones = true;
  }

  // Cerrar modal de vacaciones
  cerrarModalVacaciones() {
    this.showModalVacaciones = false;
    this.vacacionSeleccionada = null;
  }

  // Enviar respuesta a solicitud de vacaciones
  responderVacaciones() {
    if (this.respuestaVacacion.estado === 'rechazada' && !this.respuestaVacacion.justificacion_respuesta) {
      alert('Debe justificar el rechazo de la solicitud.');
      return;
    }

    this.isSubmittingRespuesta = true;
    this.tiempoService.responderVacaciones(this.vacacionSeleccionada.id, this.respuestaVacacion).subscribe({
      next: (res) => {
        this.isSubmittingRespuesta = false;
        alert(res.message);
        this.cerrarModalVacaciones();
        this.cargarVacaciones();
      },
      error: (err) => {
        this.isSubmittingRespuesta = false;
        console.error(err);
        alert('Error al responder a la solicitud de vacaciones.');
      }
    });
  }
}
