import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService, Venta } from '../../../../../services/venta.service';
import { ClienteService, Cliente } from '../../../../../services/cliente.service';
import { CajaService, Caja } from '../../../../../services/caja.service';
import { ProductoService, Producto } from '../../../../../services/producto.service';
import { ToastService } from '../../../../../services/toast.service';
import { timeout } from 'rxjs';

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
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);

  activeTab: string = 'pos';

  // Variables POS
  clienteSeleccionado: number | '' = '';
  clientesDisponibles: Cliente[] = [];

  productoActual: any = '';
  productosDisponibles: Producto[] = [];

  cantidadActual: number = 1;
  metodoPago: string = 'efectivo';
  carrito: any[] = [];
  totalCarrito: number = 0;

  guardando: boolean = false;
  cargando: boolean = false;
  cajas: Caja[] = [];

  // Variables Historial
  searchTerm: string = '';
  ventas: any[] = [];
  ventasFiltradas: any[] = [];

  // Variables Modal Anulación
  showModalAnular: boolean = false;
  ventaSeleccionada: any = null;

  ngOnInit() {
    this.cargarDatosBase();
    this.cargarVentas();
  }

  cargarDatosBase() {
    this.cargando = true;
    this.clienteService.getClientes().pipe(timeout(8000)).subscribe({
      next: (res) => { this.clientesDisponibles = res; },
      error: () => { this.clientesDisponibles = []; }
    });

    this.productoService.getProductos().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.productosDisponibles = res.filter(p => p.activo !== false);
      },
      error: () => { this.productosDisponibles = []; }
    });

    this.cajaService.getCajas().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.cajas = res.filter(c => c.estado === 'abierta');
        this.cargando = false;
      },
      error: () => {
        this.cajas = [];
        this.cargando = false;
      }
    });
  }

  cargarVentas() {
    this.ventaService.getVentas().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.ventas = res;
        this.filtrarVentas();
      },
      error: () => {
        this.ventas = [];
        this.ventasFiltradas = [];
        this.toast.error('Error al cargar el historial de ventas');
      }
    });
  }

  filtrarVentas() {
    const term = this.searchTerm.toLowerCase();
    this.ventasFiltradas = this.ventas.filter(v =>
      (v.factura_consecutivo?.toString() || '').includes(term) ||
      v.cliente?.nombres?.toLowerCase().includes(term) ||
      v.cliente?.apellidos?.toLowerCase().includes(term)
    );
  }

  numeroFactura(venta: any): string {
    return 'FAC-' + String(venta.factura_consecutivo ?? venta.id ?? '').padStart(3, '0');
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  exportarExcel() {
    this.toast.success('Exportando historial a Excel...');
  }

  agregarAlCarrito() {
    if (!this.productoActual || this.cantidadActual <= 0) {
      this.toast.warning('Seleccione un producto y cantidad válida');
      return;
    }

    const prod = this.productosDisponibles.find(p => p.id == this.productoActual);
    if (prod) {
      const existente = this.carrito.find(item => item.id == prod.id);
      if (existente) {
        existente.cantidad += this.cantidadActual;
        existente.subtotal = existente.precio_unitario * existente.cantidad;
      } else {
        this.carrito.push({
          id: prod.id,
          nombre: prod.nombre,
          precio_unitario: prod.precio_venta,
          cantidad: this.cantidadActual,
          subtotal: prod.precio_venta * this.cantidadActual
        });
      }
      this.calcularTotales();
      this.productoActual = '';
      this.cantidadActual = 1;
    }
  }

  removerDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    this.totalCarrito = this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  registrarVenta() {
    if (!this.clienteSeleccionado) {
      this.toast.warning('Debe seleccionar un cliente');
      return;
    }
    if (this.carrito.length === 0) {
      this.toast.warning('El carrito está vacío');
      return;
    }

    this.guardando = true;
    const payload: any = {
      cliente_id: this.clienteSeleccionado,
      metodo_pago: this.metodoPago,
      productos: this.carrito.map(item => ({
        id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    };

    this.ventaService.registrarVenta(payload).pipe(timeout(15000)).subscribe({
      next: () => {
        this.toast.success('Venta registrada con éxito');
        this.guardando = false;
        this.carrito = [];
        this.calcularTotales();
        this.clienteSeleccionado = '';
        this.cargarVentas();
      },
      error: (err) => {
        this.guardando = false;
        this.toast.error(err.error?.message || 'Error al registrar la venta');
      }
    });
  }

  getBadgeClass(estado: string): string {
    if (estado === 'Completada') return 'badge-aprobada';
    if (estado === 'Anulada') return 'badge-rechazada';
    return 'badge-pendiente';
  }

  cambiarEstadoPaquete(venta: any, nuevoEstado: string) {
    if (!venta?.id || !venta.cliente_id) return;
    this.ventaService.updateEstadoPaquete(venta.id, nuevoEstado, venta.cliente_id).pipe(timeout(8000)).subscribe({
      next: () => {
        venta.estado_paquete = nuevoEstado;
        this.toast.success('Estado del paquete actualizado');
      },
      error: () => this.toast.error('Error al actualizar el estado del paquete')
    });
  }

  abrirModalAnular(venta: any) {
    this.ventaSeleccionada = venta;
    this.showModalAnular = true;
  }

  cerrarModalAnular() {
    this.showModalAnular = false;
    this.ventaSeleccionada = null;
  }

  confirmarAnulacion() {
    if (!this.ventaSeleccionada?.id) return;
    this.guardando = true;
    this.ventaService.anularVenta(this.ventaSeleccionada.id).pipe(timeout(15000)).subscribe({
      next: () => {
        this.toast.success('Venta anulada correctamente');
        this.guardando = false;
        this.cerrarModalAnular();
        this.cargarVentas();
      },
      error: (err) => {
        this.guardando = false;
        this.toast.error(err.error?.message || 'Error al anular la venta');
      }
    });
  }
}