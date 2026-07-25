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

  // --- ESTADO DE CAJA ---
  cajaAbierta = false;
  montoApertura = 0;
  guardando = false;
  
  // Movimientos
  movimientos: any[] = [];
  tipoMovimiento = 'ingreso';
  montoMovimiento = 0;
  conceptoMovimiento = '';

  // --- PREFACTURAS PENDIENTES ---
  prefacturas = [
    { id: 1, consecutivo: 'REM-2001', cliente: 'Juan Pérez', fecha: '25/07/2026', total: 2585000, estado: 'Pendiente' },
    { id: 2, consecutivo: 'REM-2002', cliente: 'Restaurante El Sabor', fecha: '25/07/2026', total: 145000, estado: 'Pendiente' }
  ];

  // --- MODALES & TOASTS ---
  showModalApertura = false;
  showModalCierre = false;
  showToast = false;
  toastMessage = '';
  toastType = '';

  ngOnInit(): void {}

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // --- LÓGICA DE CAJA ---
  abrirCajaModal() {
    this.montoApertura = 0;
    this.showModalApertura = true;
  }

  cerrarCajaModal() {
    this.showModalApertura = false;
  }

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

  get totalIngresos() {
    return this.movimientos
      .filter(m => m.tipo === 'ingreso' || m.tipo === 'apertura')
      .reduce((acc, m) => acc + m.monto, 0);
  }

  get totalEgresos() {
    return this.movimientos
      .filter(m => m.tipo === 'egreso')
      .reduce((acc, m) => acc + m.monto, 0);
  }

  get saldoActual() {
    return this.totalIngresos - this.totalEgresos;
  }

  abrirCierreModal() {
    this.showModalCierre = true;
  }

  cerrarCierreModal() {
    this.showModalCierre = false;
  }

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

  getBadgeClass(estado: string) {
    return estado === 'Facturada' ? 'badge-success' : 'badge-warning';
  }

  mostrarToast(mensaje: string, tipo: string) {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }
}
