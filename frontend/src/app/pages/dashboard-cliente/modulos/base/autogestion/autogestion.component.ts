import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiempoService } from '../../../../../services/tiempo.service';
import { EmpleadoService } from '../../../../../services/empleado.service';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-autogestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autogestion.component.html',
  styleUrl: './autogestion.component.scss'
})
export class AutogestionComponent implements OnInit {
  private tiempoService = inject(TiempoService);
  private empleadoService = inject(EmpleadoService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  usuarioActual: any;
  pestanaActual = 'vacaciones'; // 'vacaciones' | 'turnos' | 'documentos'
  
  // Vacaciones
  misVacaciones: any[] = [];
  nuevaVacacion = {
    fecha_inicio: '',
    fecha_fin: '',
    tipo: 'vacaciones',
    observaciones: ''
  };

  // Documentos
  misDocumentos: any[] = [];
  archivoSeleccionado: File | null = null;
  nombreArchivo = '';

  // Turnos
  misTurnos: any[] = []; // O usamos la lógica que determine el backend para 'mis-turnos'

  cargando = false;
  guardando = false;

  ngOnInit() {
    this.usuarioActual = this.authService.getUser();
    this.cargarVacaciones();
  }

  cambiarPestana(pestana: string) {
    this.pestanaActual = pestana;
    if (pestana === 'vacaciones') this.cargarVacaciones();
    if (pestana === 'documentos') this.cargarDocumentos();
    if (pestana === 'turnos') this.cargarTurnos();
  }

  // --- VACACIONES ---
  cargarVacaciones() {
    if (!this.usuarioActual) return;
    this.cargando = true;
    this.tiempoService.getMisVacaciones(this.usuarioActual.id).subscribe({
      next: (res) => {
        this.misVacaciones = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.toast.error('Error al cargar historial de vacaciones');
      }
    });
  }

  solicitarVacaciones() {
    if (!this.nuevaVacacion.fecha_inicio || !this.nuevaVacacion.fecha_fin) {
      this.toast.warning('Complete las fechas');
      return;
    }
    
    this.guardando = true;
    const payload = { ...this.nuevaVacacion, usuario_id: this.usuarioActual?.id };
    
    this.tiempoService.solicitarVacaciones(payload).subscribe({
      next: () => {
        this.toast.success('Solicitud enviada al administrador');
        this.guardando = false;
        this.nuevaVacacion = { fecha_inicio: '', fecha_fin: '', tipo: 'vacaciones', observaciones: '' };
        this.cargarVacaciones();
      },
      error: () => {
        this.toast.error('Error al enviar la solicitud');
        this.guardando = false;
      }
    });
  }

  // --- DOCUMENTOS ---
  cargarDocumentos() {
    this.cargando = true;
    this.empleadoService.getMisDocumentos().subscribe({
      next: (res) => {
        this.misDocumentos = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.toast.error('Error al cargar documentos');
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.archivoSeleccionado = event.target.files[0];
    }
  }

  subirDocumento() {
    if (!this.archivoSeleccionado || !this.nombreArchivo || !this.usuarioActual) {
      this.toast.warning('Complete nombre y seleccione un archivo');
      return;
    }

    this.guardando = true;
    const formData = new FormData();
    formData.append('documento', this.archivoSeleccionado);
    formData.append('nombre', this.nombreArchivo);
    
    // Suponiendo que se guarda usando el empleado_id, que puede ser igual al usuario_id o depender del backend
    this.empleadoService.uploadDocumento(this.usuarioActual.id, formData).subscribe({
      next: () => {
        this.toast.success('Documento subido correctamente');
        this.guardando = false;
        this.nombreArchivo = '';
        this.archivoSeleccionado = null;
        this.cargarDocumentos();
      },
      error: () => {
        this.toast.error('Error al subir el documento');
        this.guardando = false;
      }
    });
  }

  eliminarDocumento(id: number) {
    if (confirm('¿Eliminar este documento?')) {
      this.empleadoService.deleteDocumento(id).subscribe({
        next: () => {
          this.toast.success('Documento eliminado');
          this.cargarDocumentos();
        },
        error: () => this.toast.error('Error al eliminar')
      });
    }
  }

  // --- TURNOS ---
  cargarTurnos() {
    // Aquí idealmente llamaríamos a this.tiempoService.getMisTurnos(this.usuarioActual.id)
    // Usaremos getTurnos() por ahora como placeholder si no existe el endpoint de mis turnos
    this.cargando = true;
    this.tiempoService.getTurnos().subscribe({
      next: (res) => {
        this.misTurnos = res;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
}
