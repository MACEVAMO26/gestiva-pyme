import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
})
export class Inventario implements OnInit {
  private http = inject(HttpClient);

  // --- TABS ---
  activeTab: string = 'catalogo'; // catalogo | movimientos | ajustes | kardex

  // --- VARIABLES DE ESTADO ---
  showModal = false;
  searchTerm = '';

  // --- DATOS MOCK (Simulación) ---
  productos: any[] = [];

  // --- FORMULARIO NUEVO PRODUCTO ---
  formProducto: any = {
    codigo: '',
    nombre: '',
    categoria_id: '',
    precio_venta: 0,
    precio_compra: 0,
    stock_inicial: 0,
    unidad_medida: 'Unidad'
  };

  archivoSeleccionado: File | null = null;

  // --- TOAST/ALERTAS ---
  toastMessage = '';
  toastType = ''; // 'success' | 'error' | 'warning'
  showToast = false;
  guardando = false;

  // Al iniciar el componente
  ngOnInit(): void {}

  // --- METODOS DE NAVEGACION ---
  // Para cambiar de pestaña
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // Para exportar a Excel
  exportarExcel() {
    this.http.get('/api/export/productos', { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventario_${new Date().toISOString().split('T')[0]}.xlsx`;
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

  // --- METODOS MODAL PRODUCTO ---
  // Para abrir modal de producto
  abrirModal() {
    this.formProducto = { codigo: '', nombre: '', categoria_id: '', precio_venta: 0, precio_compra: 0, stock_inicial: 0, unidad_medida: 'Unidad' };
    this.archivoSeleccionado = null;
    this.showModal = true;
  }

  // Para cerrar modal de producto
  cerrarModal() {
    this.showModal = false;
  }

  // --- ACCIONES PRINCIPALES ---
  // Para cargar los datos del inventario
  cargarDatos() {
    this.http.get<any[]>('/api/productos').subscribe({
      next: (data) => this.productos = data,
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  // Para manejar la selección de archivos
  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  // Para guardar un nuevo producto
  guardarProducto() {
    // Validaciones básicas
    if (!this.formProducto.codigo || !this.formProducto.nombre || !this.formProducto.categoria_id) {
      this.mostrarToast('Por favor completa los campos obligatorios.', 'warning');
      return;
    }

    this.guardando = true;

    const formData = new FormData();
    formData.append('codigo', this.formProducto.codigo);
    formData.append('nombre', this.formProducto.nombre);
    formData.append('categoria_id', this.formProducto.categoria_id);
    formData.append('precio_venta', this.formProducto.precio_venta.toString());
    formData.append('precio_compra', this.formProducto.precio_compra.toString());
    formData.append('stock_inicial', this.formProducto.stock_inicial.toString());
    formData.append('unidad_medida', this.formProducto.unidad_medida);

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    this.http.post('/api/productos', formData).subscribe({
      next: (res) => {
        this.guardando = false;
        this.mostrarToast('Producto guardado con éxito', 'success');
        this.cerrarModal();
        this.cargarDatos(); // Refresh list
      },
      error: (err) => {
        this.guardando = false;
        console.error(err);
        this.mostrarToast('Error al guardar el producto', 'error');
      }
    });
  }

  // Para mostrar notificaciones
  mostrarToast(mensaje: string, tipo: string) {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  // --- FILTROS ---
  // Para obtener productos filtrados
  get productosFiltrados() {
    if (!this.searchTerm) return this.productos;
    const term = this.searchTerm.toLowerCase();
    return this.productos.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.codigo.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term)
    );
  }

  // Para obtener la clase del badge
  getBadgeClass(stock: number, minimo: number) {
    if (stock === 0) return 'badge-danger';
    if (stock <= minimo) return 'badge-warning';
    return 'badge-success';
  }
}
