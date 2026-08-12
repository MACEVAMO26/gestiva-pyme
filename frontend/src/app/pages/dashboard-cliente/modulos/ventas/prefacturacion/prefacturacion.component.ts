import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../../services/toast.service';
// import { PrefacturacionService } from '../../../../../services/prefacturacion.service'; // Descomentar si se usa para el backend

@Component({
  selector: 'app-prefacturacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prefacturacion.component.html',
  styleUrl: './prefacturacion.component.scss'
})
export class PrefacturacionComponent implements OnInit {
  private toast = inject(ToastService);

  activeTab: string = 'caja';
  
  // Variables Caja
  cajaAbierta: boolean = false;
  showModalApertura: boolean = false;
  montoApertura: number = 0;
  
  totalIngresos: number = 0;
  totalEgresos: number = 0;
  saldoActual: number = 0;
  
  showModalCierre: boolean = false;
  
  tipoMovimiento: string = 'ingreso';
  montoMovimiento: number = 0;
  conceptoMovimiento: string = '';
  movimientos: any[] = [];
  
  // Variables Prefacturas
  prefacturas: any[] = [];
  
  // Estado global
  guardando: boolean = false;
  
  // Toast
  showToast: boolean = false;
  toastType: string = 'success';
  toastMessage: string = '';

  ngOnInit() {
    this.cargarDatosDemo();
  }

  cargarDatosDemo() {
    this.prefacturas = [
      { id: 1, consecutivo: 'PRE-1001', cliente: 'Carlos Vargas', fecha: '2023-11-20', total: 150000, estado: 'Pendiente' },
      { id: 2, consecutivo: 'PRE-1002', cliente: 'Empresa XYZ', fecha: '2023-11-21', total: 450000, estado: 'Procesada' }
    ];
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  abrirCajaModal() {
    this.montoApertura = 0;
    this.showModalApertura = true;
  }

  cerrarCajaModal() {
    this.showModalApertura = false;
  }

  confirmarApertura() {
    this.guardando = true;
    setTimeout(() => {
      this.cajaAbierta = true;
      this.saldoActual = this.montoApertura;
      this.movimientos.unshift({
        fecha: new Date().toLocaleTimeString(),
        tipo: 'apertura',
        concepto: 'Base inicial de caja',
        monto: this.montoApertura
      });
      this.guardando = false;
      this.cerrarCajaModal();
      this.mostrarToast('Caja abierta correctamente', 'success');
    }, 1000);
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
      this.saldoActual = 0;
      this.totalIngresos = 0;
      this.totalEgresos = 0;
      this.movimientos = [];
      this.guardando = false;
      this.cerrarCierreModal();
      this.mostrarToast('Caja cerrada correctamente', 'success');
    }, 1500);
  }

  registrarMovimiento() {
    if (!this.conceptoMovimiento || this.montoMovimiento <= 0) {
      this.mostrarToast('Complete el monto y concepto', 'warning');
      return;
    }

    if (this.tipoMovimiento === 'egreso' && this.montoMovimiento > this.saldoActual) {
      this.mostrarToast('Saldo insuficiente en caja', 'error');
      return;
    }

    this.movimientos.unshift({
      fecha: new Date().toLocaleTimeString(),
      tipo: this.tipoMovimiento,
      concepto: this.conceptoMovimiento,
      monto: this.montoMovimiento
    });

    if (this.tipoMovimiento === 'ingreso') {
      this.totalIngresos += this.montoMovimiento;
      this.saldoActual += this.montoMovimiento;
    } else {
      this.totalEgresos += this.montoMovimiento;
      this.saldoActual -= this.montoMovimiento;
    }

    this.montoMovimiento = 0;
    this.conceptoMovimiento = '';
    this.mostrarToast('Movimiento registrado', 'success');
  }

  getBadgeClass(estado: string): string {
    if (estado === 'Procesada') return 'badge-aprobada';
    if (estado === 'Rechazada') return 'badge-rechazada';
    return 'badge-pendiente';
  }

  generarDocumento(id: number) {
    const pref = this.prefacturas.find(p => p.id === id);
    if (pref) {
      pref.estado = 'Procesada';
      this.mostrarToast('Factura generada', 'success');
    }
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'warning' | 'error') {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
