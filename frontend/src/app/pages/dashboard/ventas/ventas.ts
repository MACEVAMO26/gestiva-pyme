import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss',
})
export class Ventas implements OnInit {
  // --- TABS ---
  activeTab: string = 'pos'; // pos | historial

  // --- ESTADOS ---
  searchTerm = '';
  showModalAnular = false;
  ventaSeleccionada: any = null;
  guardando = false;

  // --- TOAST/ALERTAS ---
  toastMessage = '';
  toastType = '';
  showToast = false;

  // --- DATOS MOCK POS ---
  carrito: any[] = [];
  clienteSeleccionado = '';
  productosDisponibles: any[] = [];
  productoActual = '';
  cantidadActual = 1;

  // --- DATOS MOCK HISTORIAL ---
  ventas: any[] = [];

  ngOnInit(): void {}

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // --- LOGICA POS (NUEVA VENTA) ---
  agregarAlCarrito() {
    if (!this.productoActual || this.cantidadActual < 1) return;
    
    const prod = this.productosDisponibles.find(p => p.nombre === this.productoActual);
    if (prod) {
      this.carrito.push({
        codigo: prod.codigo,
        nombre: prod.nombre,
        precio: prod.precio,
        cantidad: this.cantidadActual,
        subtotal: prod.precio * this.cantidadActual
      });
      // reset form
      this.productoActual = '';
      this.cantidadActual = 1;
    }
  }

  removerDelCarrito(index: number) {
    this.carrito.splice(index, 1);
  }

  get totalCarrito() {
    return this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  registrarVenta() {
    if (!this.clienteSeleccionado) {
      this.mostrarToast('Por favor, selecciona o ingresa un cliente.', 'warning');
      return;
    }
    if (this.carrito.length === 0) {
      this.mostrarToast('El carrito está vacío.', 'warning');
      return;
    }

    this.guardando = true;
    setTimeout(() => {
      const nueva = {
        id: this.ventas.length + 1,
        factura: `FAC-100${this.ventas.length + 1}`,
        cliente: this.clienteSeleccionado,
        fecha: new Date().toLocaleDateString('es-CO'),
        total: this.totalCarrito,
        estado: 'Pagada'
      };
      
      this.ventas.unshift(nueva);
      
      // Limpiar POS
      this.carrito = [];
      this.clienteSeleccionado = '';
      this.guardando = false;
      this.mostrarToast('Venta registrada con éxito', 'success');
      this.switchTab('historial');
    }, 1000);
  }

  // --- LOGICA HISTORIAL ---
  abrirModalAnular(venta: any) {
    this.ventaSeleccionada = venta;
    this.showModalAnular = true;
  }

  cerrarModalAnular() {
    this.showModalAnular = false;
    this.ventaSeleccionada = null;
  }

  confirmarAnulacion() {
    if (this.ventaSeleccionada) {
      this.guardando = true;
      setTimeout(() => {
        this.ventaSeleccionada.estado = 'Anulada';
        this.cerrarModalAnular();
        this.guardando = false;
        this.mostrarToast('La venta ha sido anulada exitosamente', 'success');
      }, 800);
    }
  }

  get ventasFiltradas() {
    if (!this.searchTerm) return this.ventas;
    const term = this.searchTerm.toLowerCase();
    return this.ventas.filter(v => 
      v.factura.toLowerCase().includes(term) || 
      v.cliente.toLowerCase().includes(term) ||
      v.estado.toLowerCase().includes(term)
    );
  }

  getBadgeClass(estado: string) {
    switch(estado) {
      case 'Pagada': return 'badge-success';
      case 'Pendiente': return 'badge-warning';
      case 'Anulada': return 'badge-danger';
      default: return 'badge-secondary';
    }
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
