import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService, Venta, VentaDetalle } from '../../../../../services/venta.service';
import { ClienteService, Cliente } from '../../../../../services/cliente.service';
import { CajaService, Caja } from '../../../../../services/caja.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit {
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private cajaService = inject(CajaService);
  private toast = inject(ToastService);

  clientes: Cliente[] = [];
  cajas: Caja[] = [];
  
  cargando = false;
  cobrando = false;

  // Estado del Carrito POS
  ventaActual: Venta = {
    cliente_id: 0,
    caja_id: 0,
    subtotal: 0,
    impuestos: 0,
    descuento: 0,
    total: 0,
    metodo_pago: 'efectivo',
    estado: 'completada',
    detalles: []
  };

  nuevoItem: VentaDetalle = {
    tipo_item: 'producto',
    nombre_item: '',
    cantidad: 1,
    precio_unitario: 0,
    subtotal: 0
  };

  ngOnInit() {
    this.cargarDatosBase();
  }

  cargarDatosBase() {
    this.cargando = true;
    this.clienteService.getClientes().subscribe(res => this.clientes = res);
    this.cajaService.getCajas().subscribe(res => {
      this.cajas = res.filter(c => c.estado === 'abierta');
      this.cargando = false;
    });
  }

  agregarAlCarrito() {
    if (!this.nuevoItem.nombre_item || this.nuevoItem.cantidad <= 0 || this.nuevoItem.precio_unitario <= 0) {
      this.toast.warning('Complete los datos del ítem correctamente');
      return;
    }

    this.nuevoItem.subtotal = this.nuevoItem.cantidad * this.nuevoItem.precio_unitario;
    
    // Usamos el spread operator para clonar el objeto y no pasar la referencia
    this.ventaActual.detalles?.push({ ...this.nuevoItem });
    
    this.calcularTotales();
    
    // Resetear form item
    this.nuevoItem = {
      tipo_item: 'producto',
      nombre_item: '',
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0
    };
  }

  removerDelCarrito(index: number) {
    this.ventaActual.detalles?.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    let sub = 0;
    this.ventaActual.detalles?.forEach(item => sub += item.subtotal);
    
    this.ventaActual.subtotal = sub;
    // Asumiendo un IVA genérico del 19% para el demo si aplica, o 0 si es neto.
    this.ventaActual.impuestos = sub * 0.19; 
    this.ventaActual.total = this.ventaActual.subtotal + this.ventaActual.impuestos - this.ventaActual.descuento;
  }

  cobrarVenta() {
    if (!this.ventaActual.cliente_id) {
      this.toast.warning('Debe seleccionar un cliente (o Consumidor Final)');
      return;
    }
    if (!this.ventaActual.caja_id) {
      this.toast.warning('Debe seleccionar una caja abierta');
      return;
    }
    if (this.ventaActual.detalles?.length === 0) {
      this.toast.warning('El carrito está vacío');
      return;
    }

    this.cobrando = true;
    this.ventaService.registrarVenta(this.ventaActual).subscribe({
      next: () => {
        this.toast.success('Venta registrada con éxito');
        this.cobrando = false;
        
        // Limpiar carrito
        this.ventaActual.detalles = [];
        this.calcularTotales();
      },
      error: () => {
        this.toast.error('Error al procesar el cobro');
        this.cobrando = false;
      }
    });
  }
}
