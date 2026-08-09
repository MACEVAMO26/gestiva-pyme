import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss',
})
export class Ventas implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // --- VARIABLES DE ESTADO ---
  activeTab: string = 'pos'; // pos | historial

  searchTerm = '';
  showModalAnular = false;
  ventaSeleccionada: any = null;
  guardando = false;

  // --- TOAST/ALERTAS ---
  toastMessage = '';
  toastType = '';
  showToast = false;

  // --- DATOS POS ---
  carrito: any[] = [];
  clientesDisponibles: any[] = [];
  clienteSeleccionado: any = '';
  productosDisponibles: any[] = [];
  productoActual: any = '';
  cantidadActual = 1;
  metodoPago = 'Efectivo';

  // --- DATOS HISTORIAL ---
  ventas: any[] = [];

  // Inicializar componente
  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar datos de la API
  cargarDatos() {
    // Cargar productos
    this.http.get<any[]>('/api/productos').subscribe({
      next: (data) => this.productosDisponibles = data,
      error: (err) => console.error('Error cargando productos', err)
    });

    // Cargar clientes
    this.http.get<any[]>('/api/clientes').subscribe({
      next: (data) => this.clientesDisponibles = data,
      error: (err) => console.error('Error cargando clientes', err)
    });

    // Cargar historial de ventas
    this.http.get<any[]>('/api/ventas').subscribe({
      next: (data) => this.ventas = data,
      error: (err) => console.error('Error cargando ventas', err)
    });
  }

  // Cambiar pestaña activa
  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'historial') {
      this.cargarDatos();
    }
  }

  // Exportar ventas a Excel
  exportarExcel() {
    this.http.get('/api/export/ventas', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al exportar:', err);
        alert('Hubo un error al exportar el archivo.');
      }
    });
  }

  // --- LOGICA POS (NUEVA VENTA) ---
  // Agregar producto al carrito
  agregarAlCarrito() {
    if (!this.productoActual || this.cantidadActual < 1) return;
    
    const prod = this.productosDisponibles.find(p => p.id == this.productoActual);
    if (prod) {
      this.carrito.push({
        id: prod.id,
        nombre: prod.nombre,
        precio_unitario: prod.precio_venta,
        cantidad: this.cantidadActual,
        subtotal: prod.precio_venta * this.cantidadActual
      });
      // reset form
      this.productoActual = '';
      this.cantidadActual = 1;
    }
  }

  // Remover producto del carrito
  removerDelCarrito(index: number) {
    this.carrito.splice(index, 1);
  }

  // Obtener el total del carrito
  get totalCarrito() {
    return this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  // Registrar nueva venta
  registrarVenta() {
    if (!this.clienteSeleccionado) {
      this.mostrarToast('Por favor, selecciona un cliente.', 'warning');
      return;
    }
    if (this.carrito.length === 0) {
      this.mostrarToast('El carrito está vacío.', 'warning');
      return;
    }

    this.guardando = true;

    const payload = {
      cliente_id: this.clienteSeleccionado,
      metodo_pago: this.metodoPago,
      productos: this.carrito.map(item => ({
        id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    };

    this.http.post('/api/ventas', payload).subscribe({
      next: (res: any) => {
        this.guardando = false;
        this.mostrarToast('Venta registrada con éxito', 'success');
        
        // Limpiar POS
        this.carrito = [];
        this.clienteSeleccionado = '';
        this.switchTab('historial');
      },
      error: (err) => {
        this.guardando = false;
        console.error(err);
        this.mostrarToast('Error al registrar la venta', 'error');
      }
    });
  }

  // --- LOGICA HISTORIAL ---
  // Cambiar estado del paquete
  cambiarEstadoPaquete(venta: any, nuevoEstado: string) {
    this.guardando = true;
    const payload = {
      estado_paquete: nuevoEstado,
      cliente_id: venta.cliente_id
    };

    this.http.patch(`/api/ventas/${venta.id}/estado-paquete`, payload).subscribe({
      next: (res: any) => {
        this.guardando = false;
        venta.estado_paquete = nuevoEstado;
        this.mostrarToast('Estado de paquete actualizado', 'success');
      },
      error: (err) => {
        this.guardando = false;
        console.error(err);
        this.mostrarToast('Error actualizando paquete', 'error');
      }
    });
  }

  // Abrir modal para anular venta
  abrirModalAnular(venta: any) {
    this.ventaSeleccionada = venta;
    this.showModalAnular = true;
  }

  // Cerrar modal de anulación
  cerrarModalAnular() {
    this.showModalAnular = false;
    this.ventaSeleccionada = null;
  }

  // Confirmar anulación de venta
  confirmarAnulacion() {
    if (this.ventaSeleccionada) {
      this.guardando = true;
      
      // Simular anulación (luego se puede agregar endpoint si es necesario)
      setTimeout(() => {
        this.ventaSeleccionada.estado = 'Anulada';
        this.cerrarModalAnular();
        this.guardando = false;
        this.mostrarToast('La venta ha sido anulada exitosamente', 'success');
      }, 800);
    }
  }

  // Obtener ventas filtradas
  get ventasFiltradas() {
    if (!this.searchTerm) return this.ventas;
    const term = this.searchTerm.toLowerCase();
    return this.ventas.filter(v => 
      v.numero_factura?.toLowerCase().includes(term) || 
      v.cliente?.nombre?.toLowerCase().includes(term) ||
      v.estado?.toLowerCase().includes(term)
    );
  }

  // Obtener clase para el estado
  getBadgeClass(estado: string) {
    switch(estado) {
      case 'Pagada': return 'badge-success';
      case 'Pendiente': return 'badge-warning';
      case 'Anulada': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  // Mostrar notificación
  mostrarToast(mensaje: string, tipo: string) {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }
}
