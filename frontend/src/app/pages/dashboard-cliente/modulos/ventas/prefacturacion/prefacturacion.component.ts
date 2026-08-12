import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrefacturacionService, CotizacionPedido, CotizacionDetalle } from '../../../../../services/prefacturacion.service';
import { ClienteService, Cliente } from '../../../../../services/cliente.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-prefacturacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prefacturacion.component.html',
  styleUrl: './prefacturacion.component.scss'
})
export class PrefacturacionComponent implements OnInit {
  private prefactService = inject(PrefacturacionService);
  private clienteService = inject(ClienteService);
  private toast = inject(ToastService);

  cotizaciones: CotizacionPedido[] = [];
  clientes: Cliente[] = [];
  cargando = false;

  nuevaCotizacion: CotizacionPedido = {
    cliente_id: 0,
    total: 0,
    estado: 'borrador',
    notas: '',
    valido_hasta: '',
    detalles: []
  };

  nuevoDetalle: CotizacionDetalle = {
    producto_id: 0,
    cantidad: 1,
    precio_unitario: 0,
    subtotal: 0
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.prefactService.getCotizaciones().subscribe(res => {
      this.cotizaciones = res;
      this.cargando = false;
    });
    this.clienteService.getClientes().subscribe(res => this.clientes = res);
  }

  agregarDetalle() {
    if (this.nuevoDetalle.producto_id && this.nuevoDetalle.cantidad > 0) {
      this.nuevoDetalle.subtotal = this.nuevoDetalle.cantidad * this.nuevoDetalle.precio_unitario;
      this.nuevaCotizacion.detalles!.push({ ...this.nuevoDetalle });
      this.calcularTotal();
      this.nuevoDetalle = { producto_id: 0, cantidad: 1, precio_unitario: 0, subtotal: 0 };
    } else {
      this.toast.warning('Datos del ítem incompletos');
    }
  }

  calcularTotal() {
    this.nuevaCotizacion.total = this.nuevaCotizacion.detalles!.reduce((sum, item) => sum + item.subtotal, 0);
  }

  guardarCotizacion() {
    if (this.nuevaCotizacion.cliente_id === 0 || this.nuevaCotizacion.detalles!.length === 0) {
      this.toast.warning('Debe seleccionar cliente y agregar ítems');
      return;
    }
    
    this.prefactService.registrarCotizacion(this.nuevaCotizacion).subscribe({
      next: () => {
        this.toast.success('Cotización registrada');
        this.nuevaCotizacion = { cliente_id: 0, total: 0, estado: 'borrador', notas: '', valido_hasta: '', detalles: [] };
        this.cargarDatos();
      },
      error: () => this.toast.error('Error al registrar cotización')
    });
  }
}
