import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.html',
  styleUrl: './compras.scss',
})
export class Compras implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // --- TABS ---
  activeTab: string = 'ordenes'; // ordenes | recepcion

  // --- VARIABLES DE ESTADO ---
  showModalOrden = false;
  showModalRecepcion = false;
  searchTerm = '';
  ordenSeleccionadaRecepcion: any = null;

  // --- DATOS MOCK ---
  ordenes: any[] = [];
  proveedoresDisponibles: any[] = [];
  productosDisponibles: any[] = [];

  // --- FORMULARIO ORDEN ---
  formOrden: any = {
    proveedor: '',
    fechaEsperada: '',
    observaciones: '',
    total: 0
  };
  
  carritoCompras: any[] = [];
  productoActualCompra: any = '';
  cantidadActualCompra = 1;
  precioActualCompra = 0;

  // --- TOAST/ALERTAS ---
  toastMessage = '';
  toastType = ''; // 'success' | 'error' | 'warning'
  showToast = false;
  guardando = false;

  // Inicializa el componente y carga los datos base
  ngOnInit(): void {
    this.cargarDatos();
  }

  // Carga los datos necesarios del servidor
  cargarDatos() {
    this.http.get<any[]>('/api/compras/ordenes').subscribe({
      next: (data) => this.ordenes = data,
      error: (err) => console.error('Error cargando ordenes', err)
    });

    this.http.get<any[]>('/api/proveedores').subscribe({
      next: (data) => this.proveedoresDisponibles = data,
      error: (err) => console.error('Error cargando proveedores', err)
    });

    this.http.get<any[]>('/api/productos').subscribe({
      next: (data) => this.productosDisponibles = data,
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  // --- NAVEGACION ---
  // Cambia la pestaña actual
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // --- MODALES ---
  // Abre el modal para nueva orden
  abrirModalOrden() {
    this.formOrden = { proveedor: '', fechaEsperada: '', observaciones: '', total: 0 };
    this.showModalOrden = true;
  }

  // Cierra el modal de orden
  cerrarModalOrden() {
    this.showModalOrden = false;
  }
  
  // Abre el modal para confirmar recepcion
  abrirModalRecepcion() {
    this.showModalRecepcion = true;
  }

  // Cierra el modal de recepcion
  cerrarModalRecepcion() {
    this.showModalRecepcion = false;
  }

  // --- ACCIONES PRINCIPALES ---
  // Agrega un producto al carrito temporal
  agregarAlCarrito() {
    if (!this.productoActualCompra || this.cantidadActualCompra < 1) return;
    const prod = this.productosDisponibles.find(p => p.id == this.productoActualCompra);
    if (prod) {
      const precio = this.precioActualCompra > 0 ? this.precioActualCompra : prod.precio_compra;
      this.carritoCompras.push({
        id: prod.id,
        nombre: prod.nombre,
        precio_compra: precio,
        cantidad: this.cantidadActualCompra,
        subtotal: precio * this.cantidadActualCompra
      });
      this.formOrden.total = this.carritoCompras.reduce((acc, item) => acc + item.subtotal, 0);
      this.productoActualCompra = '';
      this.cantidadActualCompra = 1;
      this.precioActualCompra = 0;
    }
  }

  // Remueve un producto del carrito temporal
  removerDelCarrito(index: number) {
    this.carritoCompras.splice(index, 1);
    this.formOrden.total = this.carritoCompras.reduce((acc, item) => acc + item.subtotal, 0);
  }

  // Guarda la nueva orden de compra
  guardarOrden() {
    if (!this.formOrden.proveedor) {
      this.mostrarToast('Debe seleccionar un proveedor.', 'warning');
      return;
    }
    if (this.carritoCompras.length === 0) {
      this.mostrarToast('Debe agregar al menos un producto.', 'warning');
      return;
    }

    this.guardando = true;

    const payload = {
      proveedor_id: this.formOrden.proveedor,
      fecha_esperada: this.formOrden.fechaEsperada,
      observaciones: this.formOrden.observaciones,
      productos: this.carritoCompras
    };

    this.http.post('/api/compras/ordenes', payload).subscribe({
      next: (res: any) => {
        this.guardando = false;
        this.mostrarToast('Orden de compra guardada con éxito', 'success');
        this.cerrarModalOrden();
        this.cargarDatos();
      },
      error: (err) => {
        this.guardando = false;
        console.error(err);
        this.mostrarToast('Error guardando la orden', 'error');
      }
    });
  }

  // Cambia el estado de una orden a recibido
  recibirOrden() {
    if (!this.ordenSeleccionadaRecepcion) return;

    this.guardando = true;
    this.http.patch(`/api/compras/ordenes/${this.ordenSeleccionadaRecepcion}/estado`, { estado: 'Recibido' }).subscribe({
      next: (res) => {
        this.guardando = false;
        this.cerrarModalRecepcion();
        this.mostrarToast('Recepción registrada en el inventario', 'success');
        this.cargarDatos();
        this.ordenSeleccionadaRecepcion = null;
      },
      error: (err) => {
        this.guardando = false;
        console.error(err);
        this.mostrarToast('Error al recibir la orden', 'error');
      }
    });
  }

  // Muestra un mensaje temporal tipo toast
  mostrarToast(mensaje: string, tipo: string) {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  // --- FILTROS ---
  // Filtra las ordenes por el termino de busqueda
  get ordenesFiltradas() {
    if (!this.searchTerm) return this.ordenes;
    const term = this.searchTerm.toLowerCase();
    return this.ordenes.filter(o => 
      o.numero_orden?.toLowerCase().includes(term) || 
      o.proveedor?.nombre?.toLowerCase().includes(term) ||
      o.estado?.toLowerCase().includes(term)
    );
  }

  // Obtiene la clase CSS segun el estado
  getBadgeClass(estado: string) {
    switch(estado) {
      case 'Recibido': return 'badge-success';
      case 'Pendiente': return 'badge-warning';
      case 'Anulado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}
