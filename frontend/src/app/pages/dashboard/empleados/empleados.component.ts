import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../../services/empleado.service';
import { AuthService } from '../../../services/auth.service';
import { EstructuraComponent } from './estructura/estructura';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, EstructuraComponent],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.scss',
})
export class EmpleadosComponent implements OnInit {

  empleadoService = inject(EmpleadoService);
  authService = inject(AuthService);
  private router = inject(Router);

  pendientes: any[] = [];
  empleados: any[] = [];
  cargos: any[] = [];
  areas: any[] = [];
  roles: any[] = []; // (por si hay que asignar un rol de acceso, aunque la tabla empleado no tiene rol directamente, el usuario sí)
  
  // UI State
  currentTab = 'pendientes'; // 'pendientes' | 'activos'
  isFormalizarModalOpen = false;
  isBajaModalOpen = false;
  isSubmitting = false;

  empleadoABaja: any = null;
  motivoBaja = '';

  // Selected for formalization
  usuarioAFormalizar: any = null;
  formalizarForm: any = {
    area_id: '',
    cargo_id: '',
    tipo_contrato: '',
    fecha_contratacion: '',
    salario: null
  };

  // Configuración RRHH
  configuracionRRHH = {
    arl: '',
    caja_compensacion: ''
  };
  isConfigSubmitting = false;

  ngOnInit(): void {
    this.loadListas();
    this.cargarDatosTab();
  }

  loadListas() {
    this.empleadoService.getCargos().subscribe({ next: (data) => this.cargos = data });
    this.empleadoService.getAreas().subscribe({ next: (data) => this.areas = data });
    this.empleadoService.getRoles().subscribe({ next: (data) => this.roles = data });
  }

  // Filtered lists
  empleadosActivos: any[] = [];
  empleadosInactivos: any[] = [];
  empleadosAusentes: any[] = [];

  cargarDatosTab() {
    if (this.currentTab === 'pendientes') {
      this.empleadoService.getPendientes().subscribe({
        next: (data) => this.pendientes = data,
        error: (err) => console.error(err)
      });
    } else if (this.currentTab === 'configuracion') {
      const u = this.authService.getUser();
      if (u && u.empresa) {
        this.configuracionRRHH.arl = u.empresa.arl || '';
        this.configuracionRRHH.caja_compensacion = u.empresa.caja_compensacion || '';
      }
    } else if (this.currentTab !== 'estructura') {
      this.empleadoService.getEmpleados().subscribe({
        next: (data) => {
          this.empleados = data;
          this.empleadosActivos = this.empleados.filter((e: any) => e.estado === 'activo');
          this.empleadosInactivos = this.empleados.filter((e: any) => e.estado === 'inactivo');
          this.empleadosAusentes = this.empleados.filter((e: any) => ['vacaciones', 'permiso', 'incapacitado'].includes(e.estado));
        },
        error: (err) => console.error(err)
      });
    }
  }

  setTab(tab: string) {
    this.currentTab = tab;
    this.cargarDatosTab();
  }

  guardarConfiguracionRRHH() {
    this.isConfigSubmitting = true;
    this.empleadoService.updateRRHHSettings(this.configuracionRRHH).subscribe({
      next: (res) => {
        this.isConfigSubmitting = false;
        alert('Configuración actualizada correctamente');
        // Actualizamos el usuario en sesión (local) para reflejar cambios
        const u = this.authService.getUser();
        if (u) {
          u.empresa = res.empresa;
          localStorage.setItem('user', JSON.stringify(u));
        }
      },
      error: (err) => {
        this.isConfigSubmitting = false;
        console.error(err);
        alert('Error al guardar configuración');
      }
    });
  }

  // --- FORMALIZAR USUARIO ---
  abrirModalFormalizar(usuario: any) {
    this.usuarioAFormalizar = usuario;
    this.formalizarForm = {
      area_id: '',
      cargo_id: '',
      tipo_contrato: '',
      fecha_contratacion: new Date().toISOString().split('T')[0], // hoy
      salario: null
    };
    this.isFormalizarModalOpen = true;
  }

  cerrarModalFormalizar() {
    this.isFormalizarModalOpen = false;
    this.usuarioAFormalizar = null;
  }

  submitFormalizar() {
    this.isSubmitting = true;
    this.empleadoService.formalizarEmpleado(this.usuarioAFormalizar.id, this.formalizarForm)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          alert(res.message);
          this.cerrarModalFormalizar();
          this.cargarDatosTab(); // Recargamos para que desaparezca de pendientes
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error(err);
          alert('Error al formalizar: Revisa los datos.');
        }
      });
  }

  // --- GESTION ACTIVOS ---
  verDetalles(empleado: any) {
    // Para ver o editar datos de un empleado activo (Fase 4 o utilidades extra)
    alert('Función de ver/editar empleado en construcción.');
  }

  // --- SOLICITUD DE BAJA ---
  abrirModalBaja(empleado: any) {
    if (empleado.baja_solicitada) {
      alert('Ya existe una solicitud de baja en proceso para este empleado.');
      return;
    }
    this.empleadoABaja = empleado;
    this.motivoBaja = '';
    this.isBajaModalOpen = true;
  }

  cerrarModalBaja() {
    this.isBajaModalOpen = false;
    this.empleadoABaja = null;
    this.motivoBaja = '';
  }

  submitBaja() {
    if (!this.motivoBaja.trim()) {
      alert('Debe ingresar un motivo para la baja.');
      return;
    }

    this.isSubmitting = true;
    this.empleadoService.solicitarBaja(this.empleadoABaja.id, this.motivoBaja)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          alert(res.message);
          this.cerrarModalBaja();
          this.cargarDatosTab();
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error(err);
          alert('Error al solicitar la baja: ' + (err.error?.error || err.message));
        }
      });
  }

  irATiempos() {
    const user = this.authService.getUser();
    const entorno = user?.empresa?.slug || user?.empresa?.nombre_url || 'demo';
    this.router.navigate(['/', entorno, 'tiempo']);
  }
}
