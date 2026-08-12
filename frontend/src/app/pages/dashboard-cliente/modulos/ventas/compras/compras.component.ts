import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService } from '../../../../../services/compra.service';
import { ProveedorService, Proveedor } from '../../../../../services/proveedor.service';
import { ProductoService, Producto } from '../../../../../services/producto.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.scss'
})
export class ComprasComponent implements OnInit {
  private compraService = inject(CompraService);
  private proveedorService = inject(ProveedorService);
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);

  activeTab: string = 'ordenes';
  cargando = false;
  guardando = false;

  searchTerm: string = '';
  
  // Listas de datos mock (hasta conectar todo)
  ordenes: any[] = [];
  ordenesFiltradas: any[] = [];
  proveedoresDisponibles: any[] = [];
  productosDisponibles: any[] = [];

  // Variables Recepcion
  ordenSeleccionadaRecepcion: any = null;
  showModalRecepcion: boolean = false;

  // Variables Orden de Compra
  showModalOrden: boolean = false;
  formOrden: any = this.resetFormOrden();
  productoActualCompra: any = '';
  cantidadActualCompra: number = 1;
  precioActualCompra: number = 0;
  carritoCompras: any[] = [];

  // Toast
  showToast: boolean = false;
  toastType: string = 'success';
  toastMessage: string = '';

  ngOnInit() {
    this.cargarDatosDemo();
  }

  cargarDatosDemo() {
    this.proveedoresDisponibles = [
      { id: 1, nombre: 'Distribuidora ABC', nit: '900.123.456-1' },
      { id: 2, nombre: 'Tecnología Global S.A.', nit: '800.987.654-2' }
    ];

    this.productosDisponibles = [
      { id: 1, nombre: 'Laptop Dell', stock_inicial: 10 },
      { id: 2, nombre: 'Mouse Óptico', stock_inicial: 50 },
      { id: 3, nombre: 'Teclado Mecánico', stock_inicial: 20 }
    ];

    this.ordenes = [
      { 
        id: 1, 
        numero_orden: 'OC-1001', 
        proveedor: { nombre: 'Distribuidora ABC' }, 
        created_at: new Date('2023-11-01'), 
        updated_at: new Date('2023-11-02'),
        total: 1500000, 
        estado: 'Recibido' 
      },
      { 
        id: 2, 
        numero_orden: 'OC-1002', 
        proveedor: { nombre: 'Tecnología Global S.A.' }, 
        created_at: new Date(), 
        updated_at: new Date(),
        total: 850000, 
        estado: 'Pendiente' 
      }
    ];
    this.filtrarOrdenes();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  filtrarOrdenes() {
    if (!this.searchTerm) {
      this.ordenesFiltradas = [...this.ordenes];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.ordenesFiltradas = this.ordenes.filter(o => 
      o.numero_orden.toLowerCase().includes(term) ||
      o.proveedor?.nombre?.toLowerCase().includes(term)
    );
  }

  getBadgeClass(estado: string): string {
    if (estado === 'Recibido') return 'badge-aprobada';
    if (estado === 'Anulado') return 'badge-rechazada';
    return 'badge-pendiente';
  }

  // --- LOGICA MODAL ORDEN ---
  abrirModalOrden() {
    this.formOrden = this.resetFormOrden();
    this.carritoCompras = [];
    this.productoActualCompra = '';
    this.cantidadActualCompra = 1;
    this.precioActualCompra = 0;
    this.showModalOrden = true;
  }

  cerrarModalOrden() {
    this.showModalOrden = false;
  }

  resetFormOrden() {
    return {
      proveedor: '',
      fechaEsperada: '',
      total: 0,
      observaciones: ''
    };
  }

  agregarAlCarrito() {
    if (!this.productoActualCompra || this.cantidadActualCompra <= 0 || this.precioActualCompra <= 0) {
      this.mostrarToast('Debe seleccionar producto, cantidad y precio', 'warning');
      return;
    }

    const producto = this.productosDisponibles.find(p => p.id == this.productoActualCompra);
    if (!producto) return;

    const subtotal = this.cantidadActualCompra * this.precioActualCompra;
    
    this.carritoCompras.push({
      id: producto.id,
      nombre: producto.nombre,
      cantidad: this.cantidadActualCompra,
      precio_compra: this.precioActualCompra,
      subtotal: subtotal
    });

    this.formOrden.total += subtotal;

    this.productoActualCompra = '';
    this.cantidadActualCompra = 1;
    this.precioActualCompra = 0;
  }

  removerDelCarrito(idx: number) {
    const item = this.carritoCompras[idx];
    this.formOrden.total -= item.subtotal;
    this.carritoCompras.splice(idx, 1);
  }

  guardarOrden() {
    if (!this.formOrden.proveedor || this.carritoCompras.length === 0) {
      this.mostrarToast('Debe seleccionar proveedor y agregar productos', 'warning');
      return;
    }

    this.guardando = true;
    setTimeout(() => {
      this.mostrarToast('Orden de compra generada', 'success');
      this.cerrarModalOrden();
      this.guardando = false;
    }, 1000);
  }

  // --- LOGICA RECEPCION ---
  abrirModalRecepcion() {
    if (!this.ordenSeleccionadaRecepcion || this.ordenSeleccionadaRecepcion === 'null') {
      this.mostrarToast('Debe seleccionar una orden pendiente', 'warning');
      return;
    }
    this.showModalRecepcion = true;
  }

  cerrarModalRecepcion() {
    this.showModalRecepcion = false;
  }

  recibirOrden() {
    this.guardando = true;
    setTimeout(() => {
      this.mostrarToast('Mercancía ingresada correctamente al stock', 'success');
      this.cerrarModalRecepcion();
      this.ordenSeleccionadaRecepcion = null;
      this.guardando = false;
    }, 1500);
  }

  // --- TOAST ---
  mostrarToast(mensaje: string, tipo: 'success' | 'warning' | 'error') {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
