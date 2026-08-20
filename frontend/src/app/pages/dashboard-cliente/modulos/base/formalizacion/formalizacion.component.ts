import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../../../../services/empleado.service';
import { ToastService } from '../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-formalizacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formalizacion.component.html',
  styleUrl: './formalizacion.component.scss'
})
export class FormalizacionComponent implements OnInit {
  private empleadoService = inject(EmpleadoService);
  private toast = inject(ToastService);

  currentTab: string = 'pendientes';

  areas: any[] = [];
  cargos: any[] = [];
  pendientes: any[] = [];
  formalizados: any[] = [];

  isSubmitting: boolean = false;

  isFormalizarModalOpen: boolean = false;
  formalizarForm: any = {};
  usuarioAFormalizar: any = null;

  ngOnInit(): void {
    this.cargarPendientes();
    this.cargarAreas();
    this.cargarCargos();
    this.cargarFormalizados();
  }

  setTab(tab: string) {
    this.currentTab = tab;
  }

  cargarPendientes() {
    this.empleadoService.getPendientes().pipe(timeout(8000)).subscribe({
      next: (res) => { this.pendientes = res; },
      error: () => { this.pendientes = []; }
    });
  }

  cargarFormalizados() {
    this.empleadoService.getEmpleados().pipe(timeout(8000)).subscribe({
      next: (res) => { this.formalizados = res; },
      error: () => { this.formalizados = []; }
    });
  }

  cargarAreas() {
    this.empleadoService.getAreas().pipe(timeout(8000)).subscribe({
      next: (res) => { this.areas = res; },
      error: () => { this.areas = []; }
    });
  }

  cargarCargos() {
    this.empleadoService.getCargos().pipe(timeout(8000)).subscribe({
      next: (res) => { this.cargos = res; },
      error: () => { this.cargos = []; }
    });
  }

  abrirModalFormalizar(p: any) {
    this.usuarioAFormalizar = p;
    this.formalizarForm = { area_id: '', cargo_id: '', tipo_contrato: '', fecha_contratacion: '', salario: null };
    this.isFormalizarModalOpen = true;
  }

  cerrarModalFormalizar() {
    this.isFormalizarModalOpen = false;
  }

  submitFormalizar() {
    if (!this.formalizarForm.area_id || !this.formalizarForm.cargo_id || !this.formalizarForm.tipo_contrato || !this.formalizarForm.fecha_contratacion) {
      this.toast.warning('Complete los datos organizacionales y laborales');
      return;
    }
    if (!this.usuarioAFormalizar?.id) return;
    this.isSubmitting = true;
    this.empleadoService.formalizarEmpleado(this.usuarioAFormalizar.id, {
      area_id: this.formalizarForm.area_id,
      cargo_id: this.formalizarForm.cargo_id,
      tipo_contrato: this.formalizarForm.tipo_contrato,
      fecha_contratacion: this.formalizarForm.fecha_contratacion,
      salario: this.formalizarForm.salario
    }).pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.cerrarModalFormalizar();
        this.toast.success(res.message || 'Empleado formalizado');
        this.cargarPendientes();
        this.cargarFormalizados();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err.error?.error || 'Error al formalizar el empleado');
      }
    });
  }

  nombreCompleto(u: any): string {
    if (!u) return '';
    return [u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido].filter(Boolean).join(' ');
  }

  cargoNombre(e: any): string {
    return e?.cargo?.nombre || '—';
  }

  areaNombre(e: any): string {
    return e?.area?.nombre || '—';
  }
}