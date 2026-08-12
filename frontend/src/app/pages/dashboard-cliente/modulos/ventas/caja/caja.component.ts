import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService, Caja, CajaMovimiento } from '../../../../../services/caja.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caja.component.html',
  styleUrl: './caja.component.scss'
})
export class CajaComponent implements OnInit {
  private cajaService = inject(CajaService);
  private toast = inject(ToastService);

  cajas: Caja[] = [];
  cajaActiva: Caja | null = null;
  movimientos: CajaMovimiento[] = [];
  
  cargando = false;
  procesando = false;

  montoApertura = 0;
  montoCierre = 0;

  nuevoMovimiento: CajaMovimiento = {
    caja_id: 0,
    tipo: 'ingreso',
    monto: 0,
    concepto: ''
  };

  ngOnInit() {
    this.cargarCajas();
  }

  cargarCajas() {
    this.cargando = true;
    this.cajaService.getCajas().subscribe({
      next: (res) => {
        this.cajas = res;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  seleccionarCaja(caja: Caja) {
    this.cajaActiva = caja;
    this.nuevoMovimiento.caja_id = caja.id || 0;
    this.cargarMovimientos(caja.id!);
  }

  cargarMovimientos(cajaId: number) {
    this.cajaService.getMovimientos(cajaId).subscribe(res => {
      this.movimientos = res;
    });
  }

  abrirCaja() {
    if (!this.cajaActiva?.id) return;
    this.procesando = true;
    this.cajaService.abrirCaja(this.cajaActiva.id, this.montoApertura).subscribe({
      next: () => {
        this.toast.success('Caja abierta correctamente');
        if (this.cajaActiva) {
          this.cajaActiva.estado = 'abierta';
          this.cajaActiva.base_inicial = this.montoApertura;
        }
        this.procesando = false;
        this.cargarMovimientos(this.cajaActiva!.id!);
      },
      error: () => {
        this.toast.error('Error al abrir la caja');
        this.procesando = false;
      }
    });
  }

  cerrarCaja() {
    if (!this.cajaActiva?.id) return;
    this.procesando = true;
    this.cajaService.cerrarCaja(this.cajaActiva.id, this.montoCierre).subscribe({
      next: () => {
        this.toast.success('Caja cerrada con éxito');
        if (this.cajaActiva) {
          this.cajaActiva.estado = 'cerrada';
          this.cajaActiva.saldo_final = this.montoCierre;
        }
        this.procesando = false;
        this.cargarMovimientos(this.cajaActiva!.id!);
      },
      error: () => {
        this.toast.error('Error al cerrar caja');
        this.procesando = false;
      }
    });
  }

  registrarMovimiento() {
    if (!this.nuevoMovimiento.monto || this.nuevoMovimiento.monto <= 0) {
      this.toast.warning('Ingrese un monto válido');
      return;
    }

    this.procesando = true;
    this.cajaService.registrarMovimiento(this.nuevoMovimiento).subscribe({
      next: () => {
        this.toast.success('Movimiento registrado');
        this.nuevoMovimiento.monto = 0;
        this.nuevoMovimiento.concepto = '';
        this.procesando = false;
        if (this.cajaActiva?.id) this.cargarMovimientos(this.cajaActiva.id);
      },
      error: () => {
        this.toast.error('Error al registrar movimiento');
        this.procesando = false;
      }
    });
  }
}
