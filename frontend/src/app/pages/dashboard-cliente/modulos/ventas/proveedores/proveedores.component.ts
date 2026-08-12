import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService, Proveedor } from '../../../../../services/proveedor.service';
import { ToastService } from '../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent implements OnInit {
  private proveedorService = inject(ProveedorService);
  private toast = inject(ToastService);

  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  searchTerm: string = '';
  cargando = false;
  isSaving = false;
  deletingId: number | null = null;

  proveedorActual: Proveedor = this.proveedorVacio();

  showModal: boolean = false;
  isEditMode: boolean = false;

  showModalPago: boolean = false;
  cuentaSeleccionada: any = null;

  showModalEvaluacion: boolean = false;
  evaluacionSeleccionada: any = null;
  nuevaCalificacion: number = 5;
  nuevoComentario: string = '';

  activeTab: string = 'directorio';

  // Datos mock para otras pestañas
  cuentasPorPagar: any[] = [];
  totalDeuda: number = 0;
  contratos: any[] = [];

  ngOnInit() {
    this.cargarProveedores();
    this.cargarMockDatos();
  }

  cargarProveedores() {
    this.cargando = true;
    this.proveedorService.getProveedores().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.proveedores = res;
        this.proveedoresFiltrados = res;
        this.cargando = false;
      },
      error: () => {
        this.proveedores = [];
        this.proveedoresFiltrados = [];
        this.toast.error('Error al cargar proveedores');
        this.cargando = false;
      }
    });
  }

  cargarMockDatos() {
    this.cuentasPorPagar = [
      { id: 1, proveedor: 'Empresa A S.A.S', factura: 'F-1001', emision: '2023-11-01', vencimiento: '2023-11-30', monto: 1500000, estado: 'Vencida' },
      { id: 2, proveedor: 'Distribuidora B', factura: 'F-2050', emision: '2023-11-15', vencimiento: '2023-12-15', monto: 850000, estado: 'Pendiente' }
    ];
    this.totalDeuda = this.cuentasPorPagar.reduce((acc, c) => acc + c.monto, 0);

    this.contratos = [
      { id: 1, proveedor: 'Empresa A S.A.S', nrc: 'Evaluado', calificacion: 4.5, comentarios: 'Buen servicio general' },
      { id: 2, proveedor: 'Distribuidora B', nrc: 'Pendiente', calificacion: 0, comentarios: '' }
    ];
  }

  filtrarProveedores() {
    const term = this.searchTerm.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(p => 
      p.razon_social?.toLowerCase().includes(term) || 
      p.nit?.toLowerCase().includes(term)
    );
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  exportarExcel() {
    this.toast.success('Exportando proveedores...');
  }

  proveedorVacio(): Proveedor {
    return {
      razon_social: '',
      nit: '',
      contacto: '',
      telefono: '',
      direccion: '',
      email: '',
      documentos_url: '',
      activo: true,
      calificacion: 0,
      comentarios_evaluacion: '',
      estado_evaluacion: 'Pendiente'
    };
  }

  formatearId(id: number | undefined): string {
    if (!id) return '000';
    return id.toString().padStart(3, '0');
  }

  getBadgeEval(estado: string | undefined): string {
    if (estado === 'Evaluado') return 'badge-aprobada';
    if (estado === 'Pendiente') return 'badge-pendiente';
    return 'badge-rechazada';
  }

  getBadgeCuentas(estado: string): string {
    if (estado === 'Pagada') return 'badge-aprobada';
    if (estado === 'Vencida') return 'badge-rechazada';
    return 'badge-pendiente';
  }

  abrirModal(proveedor?: Proveedor) {
    if (proveedor) {
      this.isEditMode = true;
      this.proveedorActual = { ...proveedor };
    } else {
      this.isEditMode = false;
      this.proveedorActual = this.proveedorVacio();
    }
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardarProveedor() {
    if (!this.proveedorActual.razon_social || !this.proveedorActual.nit) {
      this.toast.warning('Razón social y NIT son obligatorios');
      return;
    }
    
    this.isSaving = true;
    if (this.isEditMode && this.proveedorActual.id) {
      this.proveedorService.actualizarProveedor(this.proveedorActual.id, this.proveedorActual).pipe(timeout(8000)).subscribe({
        next: () => {
          this.toast.success('Proveedor actualizado');
          this.cargarProveedores();
          this.cerrarModal();
          this.isSaving = false;
        },
        error: () => {
          this.toast.error('Error al actualizar proveedor');
          this.isSaving = false;
        }
      });
    } else {
      this.proveedorService.crearProveedor(this.proveedorActual).pipe(timeout(8000)).subscribe({
        next: () => {
          this.toast.success('Proveedor registrado');
          this.cargarProveedores();
          this.cerrarModal();
          this.isSaving = false;
        },
        error: () => {
          this.toast.error('Error al registrar proveedor');
          this.isSaving = false;
        }
      });
    }
  }

  eliminarProveedor(id: number | undefined) {
    if (!id) return;
    this.deletingId = id;
    this.proveedorService.eliminarProveedor(id).pipe(timeout(8000)).subscribe({
      next: () => {
        this.toast.success('Proveedor eliminado');
        this.cargarProveedores();
        this.deletingId = null;
      },
      error: () => {
        this.toast.error('Error al eliminar proveedor');
        this.deletingId = null;
      }
    });
  }

  abrirPago(cuenta: any) {
    this.cuentaSeleccionada = cuenta;
    this.showModalPago = true;
  }

  cerrarPago() {
    this.showModalPago = false;
    this.cuentaSeleccionada = null;
  }

  confirmarPago() {
    this.isSaving = true;
    setTimeout(() => {
      this.toast.success('Pago confirmado con éxito');
      this.isSaving = false;
      this.cerrarPago();
    }, 1000);
  }

  abrirEvaluar(evaluacion: any) {
    this.evaluacionSeleccionada = evaluacion;
    this.nuevaCalificacion = evaluacion.calificacion || 5;
    this.nuevoComentario = evaluacion.comentarios || '';
    this.showModalEvaluacion = true;
  }

  cerrarEvaluar() {
    this.showModalEvaluacion = false;
    this.evaluacionSeleccionada = null;
  }

  guardarEvaluacion() {
    this.isSaving = true;
    setTimeout(() => {
      this.toast.success('Evaluación guardada');
      this.isSaving = false;
      this.cerrarEvaluar();
    }, 1000);
  }
}
