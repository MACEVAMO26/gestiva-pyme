import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prefacturacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prefacturacion.html',
  styleUrl: './prefacturacion.scss',
})
export class PrefacturacionComponent implements OnInit {
  // --- TABS ---
  activeTab: string = 'caja'; // caja | prefacturas

  // --- VARIABLES DE ESTADO ---
  cajaAbierta = false;
  montoApertura = 0;
  guardando = false;
  
  // Movimientos
  movimientos: any[] = [];
  tipoMovimiento = 'ingreso';
  montoMovimiento = 0;
  conceptoMovimiento = '';

  // --- PREFACTURAS PENDIENTES ---
  prefacturas: any[] = [];

  // --- MODALES & TOASTS ---
  showModalApertura = false;
  showModalCierre = false;
  showToast = false;
  toastMessage = '';
  toastType = '';

  // Inicializar componente
  ngOnInit(): void {}

  // Cambiar de pestaña
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // --- LÓGICA DE CAJA ---
  // Abrir modal de caja
  abrirCajaModal() {
    this.montoApertura = 0;
    this.showModalApertura = true;
  }

  // Cerrar modal de apertura
  cerrarCajaModal() {
    this.showModalApertura = false;
  }

  // Confirmar la apertura de la caja
  confirmarApertura() {
    if (this.montoApertura < 0) {
      this.mostrarToast('El monto no puede ser negativo', 'error');
      return;
    }
    this.guardando = true;
    setTimeout(() => {
      this.cajaAbierta = true;
      this.movimientos = [{
        fecha: new Date().toLocaleString('es-CO'),
        tipo: 'apertura',
        concepto: 'Apertura de Caja',
        monto: this.montoApertura
      }];
      this.guardando = false;
      this.showModalApertura = false;
      this.mostrarToast('Caja abierta exitosamente', 'success');
    }, 800);
  }

  // Registrar nuevo movimiento
  registrarMovimiento() {
    if (this.montoMovimiento <= 0 || !this.conceptoMovimiento) {
      this.mostrarToast('Debe ingresar un monto válido y un concepto.', 'warning');
      return;
    }

    this.movimientos.unshift({
      fecha: new Date().toLocaleString('es-CO'),
      tipo: this.tipoMovimiento,
      concepto: this.conceptoMovimiento,
      monto: this.montoMovimiento
    });

    this.mostrarToast(`Movimiento de ${this.tipoMovimiento} registrado`, 'success');
    this.montoMovimiento = 0;
    this.conceptoMovimiento = '';
  }

  // Obtener el total de ingresos
  get totalIngresos() {
    return this.movimientos
      .filter(m => m.tipo === 'ingreso' || m.tipo === 'apertura')
      .reduce((acc, m) => acc + m.monto, 0);
  }

  // Obtener el total de egresos
  get totalEgresos() {
    return this.movimientos
      .filter(m => m.tipo === 'egreso')
      .reduce((acc, m) => acc + m.monto, 0);
  }

  // Obtener el saldo actual
  get saldoActual() {
    return this.totalIngresos - this.totalEgresos;
  }

  // Abrir modal de cierre
  abrirCierreModal() {
    this.showModalCierre = true;
  }

  // Cerrar modal de cierre
  cerrarCierreModal() {
    this.showModalCierre = false;
  }

  // Confirmar el cierre de caja
  confirmarCierre() {
    this.guardando = true;
    setTimeout(() => {
      this.cajaAbierta = false;
      this.movimientos = [];
      this.guardando = false;
      this.showModalCierre = false;
      this.mostrarToast('Caja cerrada correctamente', 'success');
    }, 1000);
  }

  // --- LÓGICA PREFACTURAS ---
  // Generar documento a partir de prefactura
  generarDocumento(id: number) {
    const idx = this.prefacturas.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.guardando = true;
      setTimeout(() => {
        this.prefacturas[idx].estado = 'Facturada';
        this.guardando = false;
        this.mostrarToast(`Factura electrónica generada para ${this.prefacturas[idx].consecutivo}`, 'success');
      }, 1000);
    }
  }

  // Obtener clase de estado
  getBadgeClass(estado: string) {
    return estado === 'Facturada' ? 'badge-success' : 'badge-warning';
  }

  // Mostrar notificación toast
  mostrarToast(mensaje: string, tipo: string) {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }
}
