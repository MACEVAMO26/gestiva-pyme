import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

export interface Proveedor {
  id?: number;
  razon_social: string;
  nit: string;
  contacto?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  documentos_url?: string;
  calificacion?: number;
  comentarios_evaluacion?: string;
  estado_evaluacion?: string;
}

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss']
})
export class ProveedoresComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // --- TABS ---
  activeTab: string = 'directorio'; // directorio | cuentas | evaluaciones

  // --- VARIABLES DE ESTADO ---
  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  searchTerm = '';
  showModal = false;
  isEditMode = false;
  isSaving = false;
  deletingId: number | null = null;
  proveedorActual: Proveedor = this.getEmptyProveedor();

  // --- MOCKS: CUENTAS POR PAGAR ---
  cuentasPorPagar: any[] = [];
  showModalPago = false;
  cuentaSeleccionada: any = null;

  // --- MOCKS: EVALUACIONES ---
  contratos: any[] = [];
  showModalEvaluacion = false;
  evaluacionSeleccionada: any = null;
  nuevaCalificacion = 5;
  nuevoComentario = '';

  // Inicializar componente
  ngOnInit() {
    this.cargarProveedores();
  }

  // Cambiar pestaña activa
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // Retornar proveedor vacío
  getEmptyProveedor(): Proveedor {
    return {
      razon_social: '',
      nit: '',
      contacto: '',
      email: '',
      telefono: '',
      direccion: '',
      documentos_url: '',
      calificacion: 0,
      comentarios_evaluacion: '',
      estado_evaluacion: 'No Evaluado'
    };
  }

  // Formatear ID de proveedor
  formatearId(id: number | undefined): string {
    if (!id) return 'PROV-000';
    return 'PROV' + id.toString().padStart(5, '0');
  }

  // Cargar lista de proveedores
  cargarProveedores() {
    const user = this.authService.getUser();
    const empresaId = user?.empresa_id || user?.empresa?.id || '';

    this.http.get<Proveedor[]>('/api/proveedores', {
      headers: { 'X-Empresa-Id': empresaId.toString() }
    }).subscribe({
      next: (data) => {
        this.proveedores = data;
        this.filtrarProveedores();
      },
      error: (err) => {
        console.error('Error cargando proveedores:', err);
        this.toastService.show('Error cargando la lista de proveedores', 'error');
      }
    });
  }

  // Filtrar proveedores por término de búsqueda
  filtrarProveedores() {
    if (!this.searchTerm) {
      this.proveedoresFiltrados = [...this.proveedores];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(p => 
      p.razon_social.toLowerCase().includes(term) ||
      p.nit.toLowerCase().includes(term) ||
      (p.contacto && p.contacto.toLowerCase().includes(term))
    );
  }

  // --- LÓGICA DIRECTORIO ---
  // Abrir modal de proveedor
  abrirModal(proveedor?: Proveedor) {
    if (proveedor) {
      this.isEditMode = true;
      this.proveedorActual = { ...proveedor };
    } else {
      this.isEditMode = false;
      this.proveedorActual = this.getEmptyProveedor();
    }
    this.showModal = true;
  }

  // Cerrar modal de proveedor
  cerrarModal() {
    this.showModal = false;
    this.proveedorActual = this.getEmptyProveedor();
  }

  // Guardar datos del proveedor
  guardarProveedor() {
    if (!this.proveedorActual.razon_social || !this.proveedorActual.nit) {
      this.toastService.show('Razón social y NIT son obligatorios', 'warning');
      return;
    }
    this.isSaving = true;
    
    // Simular guardado
    setTimeout(() => {
      this.toastService.show(this.isEditMode ? 'Proveedor actualizado' : 'Proveedor creado', 'success');
      this.cerrarModal();
      this.cargarProveedores(); // Refresca lista simulada (reemplazando lógica real por ahora)
      this.isSaving = false;
    }, 800);
  }

  // Eliminar proveedor por ID
  eliminarProveedor(id: number | undefined) {
    if (!id) return;
    this.deletingId = id;
    setTimeout(() => {
      this.toastService.show('Proveedor eliminado', 'success');
      this.deletingId = null;
      this.proveedores = this.proveedores.filter(p => p.id !== id);
      this.filtrarProveedores();
    }, 800);
  }

  // --- LÓGICA CUENTAS POR PAGAR ---
  // Obtener total de la deuda
  get totalDeuda() {
    return this.cuentasPorPagar
      .filter(c => c.estado !== 'Pagada')
      .reduce((acc, curr) => acc + curr.monto, 0);
  }

  // Obtener clase para el estado de la cuenta
  getBadgeCuentas(estado: string) {
    switch(estado) {
      case 'Pagada': return 'badge-success';
      case 'Vencida': return 'badge-danger';
      case 'Pendiente': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  // Abrir modal de pago
  abrirPago(cuenta: any) {
    this.cuentaSeleccionada = cuenta;
    this.showModalPago = true;
  }

  // Cerrar modal de pago
  cerrarPago() {
    this.showModalPago = false;
    this.cuentaSeleccionada = null;
  }

  // Confirmar registro del pago
  confirmarPago() {
    this.isSaving = true;
    setTimeout(() => {
      if (this.cuentaSeleccionada) {
        this.cuentaSeleccionada.estado = 'Pagada';
      }
      this.isSaving = false;
      this.cerrarPago();
      this.toastService.show('Pago registrado exitosamente. Deuda saldada.', 'success');
    }, 800);
  }

  // --- LÓGICA EVALUACIONES ---
  // Obtener clase para la evaluación
  getBadgeEval(nrc: string) {
    switch(nrc) {
      case 'Excelente': return 'badge-success';
      case 'Regular': return 'badge-warning';
      case 'Malo': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  // Abrir modal de evaluación
  abrirEvaluar(cont: any) {
    this.evaluacionSeleccionada = cont;
    this.nuevaCalificacion = cont.calificacion;
    this.nuevoComentario = cont.comentarios;
    this.showModalEvaluacion = true;
  }

  // Cerrar modal de evaluación
  cerrarEvaluar() {
    this.showModalEvaluacion = false;
    this.evaluacionSeleccionada = null;
  }

  // Guardar evaluación del proveedor
  guardarEvaluacion() {
    this.isSaving = true;
    setTimeout(() => {
      if (this.evaluacionSeleccionada) {
        this.evaluacionSeleccionada.calificacion = this.nuevaCalificacion;
        this.evaluacionSeleccionada.comentarios = this.nuevoComentario;
        if (this.nuevaCalificacion >= 4) this.evaluacionSeleccionada.nrc = 'Excelente';
        else if (this.nuevaCalificacion === 3) this.evaluacionSeleccionada.nrc = 'Regular';
        else this.evaluacionSeleccionada.nrc = 'Malo';
      }
      this.isSaving = false;
      this.cerrarEvaluar();
      this.toastService.show('Evaluación del proveedor actualizada', 'success');
    }, 800);
  }
}
