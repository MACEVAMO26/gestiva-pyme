import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService, Venta, VentaDetalle } from '../../../../../services/venta.service';
import { ClienteService, Cliente } from '../../../../../services/cliente.service';
import { CajaService, Caja } from '../../../../../services/caja.service';
// Simulamos servicio de producto si no está importado, o usamos un dummy
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
  private toast = inject(ToastService);

  activeTab: string = 'pos';
  
  // Variables POS
  clienteSeleccionado: number | '' = '';
  clientesDisponibles: Cliente[] = [];
  
  productoActual: any = '';
  productosDisponibles: any[] = [
    { id: 1, nombre: 'Producto Demo A', precio_venta: 15000 },
    { id: 2, nombre: 'Producto Demo B', precio_venta: 25000 }
  ];
  
  cantidadActual: number = 1;
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

  // Variables Toast (el componente tiene su propio toast en vez de usar el global en HTML)
  showToast: boolean = false;
  toastType: string = 'success';
  toastMessage: string = '';

  ngOnInit() {
    this.cargarDatosBase();
    this.cargarVentasMock(); // Historial
  }

  cargarDatosBase() {
    this.cargando = true;
    this.clienteService.getClientes().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.clientesDisponibles = res;
      },
      error: () => {
        this.clientesDisponibles = [];
      }
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

  cargarVentasMock() {
    // Mock para el historial
    this.ventas = [
      { id: 1, numero_factura: 'FAC-001', cliente: { nombre: 'Juan', apellido: 'Perez' }, created_at: new Date(), total: 50000, estado: 'Completada', estado_paquete: 'Entregado' }
    ];
    this.ventasFiltradas = this.ventas;
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  exportarExcel() {
    this.mostrarToast('Exportando historial a Excel...', 'success');
  }

  agregarAlCarrito() {
    if (!this.productoActual || this.cantidadActual <= 0) {
      this.mostrarToast('Seleccione un producto y cantidad válida', 'warning');
      return;
    }

    const prod = this.productosDisponibles.find(p => p.id == this.productoActual);
    if (prod) {
      this.carrito.push({
        id: prod.id,
        nombre: prod.nombre,
        precio_unitario: prod.precio_venta,
        cantidad: this.cantidadActual,
        subtotal: prod.precio_venta * this.cantidadActual
      });
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
      this.mostrarToast('Debe seleccionar un cliente', 'warning');
      return;
    }
    if (this.carrito.length === 0) {
      this.mostrarToast('El carrito está vacío', 'warning');
      return;
    }

    this.guardando = true;
    setTimeout(() => {
      this.mostrarToast('Venta registrada con éxito', 'success');
      this.guardando = false;
      this.carrito = [];
      this.calcularTotales();
      this.clienteSeleccionado = '';
    }, 1500);
  }

  getBadgeClass(estado: string): string {
    if (estado === 'Completada') return 'badge-aprobada';
    if (estado === 'Anulada') return 'badge-rechazada';
    return 'badge-pendiente';
  }

  cambiarEstadoPaquete(venta: any, nuevoEstado: string) {
    venta.estado_paquete = nuevoEstado;
    this.mostrarToast('Estado del paquete actualizado', 'success');
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
    this.guardando = true;
    setTimeout(() => {
      if (this.ventaSeleccionada) {
        this.ventaSeleccionada.estado = 'Anulada';
      }
      this.mostrarToast('Venta anulada correctamente', 'success');
      this.guardando = false;
      this.cerrarModalAnular();
    }, 1500);
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'warning' | 'error') {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
