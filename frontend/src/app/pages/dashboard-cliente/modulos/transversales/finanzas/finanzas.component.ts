import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finanzas.component.html',
  styleUrl: './finanzas.component.scss'
})
export class FinanzasComponent implements OnInit {
  
  // Tabs
  activeTab: string = 'caja'; // 'caja' | 'prefacturas'

  // Caja
  cajaAbierta: boolean = false;
  showModalApertura: boolean = false;
  montoApertura: number | null = null;
  guardando: boolean = false;
  
  showModalCierre: boolean = false;

  totalIngresos: number = 0;
  totalEgresos: number = 0;
  saldoActual: number = 0;

  // Movimientos
  tipoMovimiento: string = 'ingreso';
  montoMovimiento: number | null = null;
  conceptoMovimiento: string = '';
  
  movimientos: any[] = [];
  prefacturas: any[] = [];

  // Toasts
  showToast: boolean = false;
  toastType: string = 'success';
  toastMessage: string = '';

  ngOnInit() {
    this.cargarPrefacturas();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  abrirCajaModal() {
    this.montoApertura = null;
    this.showModalApertura = true;
  }

  cerrarCajaModal() {
    this.showModalApertura = false;
  }

  confirmarApertura() {
    if (this.montoApertura === null || this.montoApertura < 0) {
      this.mostrarToast('warning', 'Ingresa un monto base válido');
      return;
    }
    
    this.guardando = true;
    setTimeout(() => {
      this.cajaAbierta = true;
      this.saldoActual = this.montoApertura!;
      this.totalIngresos = 0;
      this.totalEgresos = 0;
      
      this.movimientos = [{
        fecha: new Date().toLocaleTimeString(),
        tipo: 'apertura',
        concepto: 'Base inicial de caja',
        monto: this.montoApertura
      }];

      this.guardando = false;
      this.showModalApertura = false;
      this.mostrarToast('success', 'Caja abierta con éxito');
    }, 800);
  }

  registrarMovimiento() {
    if (!this.montoMovimiento || this.montoMovimiento <= 0 || !this.conceptoMovimiento.trim()) {
      this.mostrarToast('warning', 'Ingresa monto y concepto válidos');
      return;
    }

    const nuevoMov = {
      fecha: new Date().toLocaleTimeString(),
      tipo: this.tipoMovimiento,
      concepto: this.conceptoMovimiento,
      monto: this.montoMovimiento
    };

    if (this.tipoMovimiento === 'ingreso') {
      this.totalIngresos += this.montoMovimiento;
      this.saldoActual += this.montoMovimiento;
    } else {
      this.totalEgresos += this.montoMovimiento;
      this.saldoActual -= this.montoMovimiento;
    }

    this.movimientos.unshift(nuevoMov);
    this.montoMovimiento = null;
    this.conceptoMovimiento = '';
    this.mostrarToast('success', 'Movimiento registrado');
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
      this.guardando = false;
      this.showModalCierre = false;
      this.mostrarToast('success', 'Cierre de caja exitoso');
    }, 1000);
  }

  cargarPrefacturas() {
    this.prefacturas = [
      { id: 1, consecutivo: 'PRE-0001', cliente: 'Cliente A', fecha: '2023-11-20', total: 150000, estado: 'Pendiente' },
      { id: 2, consecutivo: 'PRE-0002', cliente: 'Cliente B', fecha: '2023-11-20', total: 45000, estado: 'Pendiente' },
      { id: 3, consecutivo: 'PRE-0003', cliente: 'Cliente C', fecha: '2023-11-21', total: 200000, estado: 'Procesada' }
    ];
  }

  getBadgeClass(estado: string): string {
    if (estado === 'Pendiente') return 'badge-warning';
    if (estado === 'Procesada') return 'badge-success';
    return 'badge-secondary';
  }

  generarDocumento(id: number) {
    const pref = this.prefacturas.find(p => p.id === id);
    if (pref) {
      if (!this.cajaAbierta) {
        this.mostrarToast('error', 'Debes abrir caja primero');
        return;
      }
      
      pref.estado = 'Procesada';
      
      // Registrar ingreso automático
      this.tipoMovimiento = 'ingreso';
      this.montoMovimiento = pref.total;
      this.conceptoMovimiento = `Pago Factura ${pref.consecutivo} - ${pref.cliente}`;
      this.registrarMovimiento();
    }
  }

  mostrarToast(type: string, message: string) {
    this.toastType = type;
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
