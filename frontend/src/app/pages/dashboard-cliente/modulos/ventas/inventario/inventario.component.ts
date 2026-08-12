import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto, Categoria } from '../../../../../services/producto.service';
import { InventarioService } from '../../../../../services/inventario.service';
import { ToastService } from '../../../../../services/toast.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  private productoService = inject(ProductoService);
  private inventarioService = inject(InventarioService);
  private toast = inject(ToastService);

  activeTab: string = 'catalogo';

  categorias: Categoria[] = [];
  productosFiltrados: any[] = [];
  productosOriginales: any[] = [];
  searchTerm: string = '';
  
  cargando = false;
  guardando = false;

  showModal: boolean = false;
  formProducto: any = this.resetFormProducto();

  // Toast
  showToast: boolean = false;
  toastType: string = 'success';
  toastMessage: string = '';

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.productoService.getCategorias().pipe(timeout(8000)).subscribe({
      next: (res) => {
        this.categorias = res;
      },
      error: () => {
        this.categorias = [];
        this.cargando = false;
      }
    });
    
    // Mock data for UI until backend is fully integrated
    const mockProductos = [
      { id: 1, codigo: 'PRD-001', nombre: 'Laptop Dell Inspiron', categoria: 'Equipos', precio: 2500000, costo: 2000000, stock: 15, stockMinimo: 5, estado: 'Activo' },
      { id: 2, codigo: 'PRD-002', nombre: 'Mouse Inalámbrico', categoria: 'Accesorios', precio: 45000, costo: 25000, stock: 3, stockMinimo: 10, estado: 'Activo' },
      { id: 3, codigo: 'PRD-003', nombre: 'Monitor LG 24"', categoria: 'Equipos', precio: 650000, costo: 500000, stock: 0, stockMinimo: 2, estado: 'Inactivo' }
    ];
    
    this.productosOriginales = mockProductos;
    this.productosFiltrados = [...this.productosOriginales];
    this.cargando = false;
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  abrirModal() {
    this.formProducto = this.resetFormProducto();
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  resetFormProducto() {
    return {
      codigo: '',
      nombre: '',
      categoria_id: '',
      unidad_medida: '',
      precio_venta: 0,
      precio_compra: 0,
      stock_inicial: 0
    };
  }

  onFileSelected(event: any) {
    // Manejo de archivo
  }

  guardarProducto() {
    if (!this.formProducto.nombre || !this.formProducto.codigo) {
      this.mostrarToast('Nombre y código obligatorios', 'warning');
      return;
    }
    
    this.guardando = true;
    setTimeout(() => {
      this.mostrarToast('Producto guardado exitosamente', 'success');
      this.cerrarModal();
      this.guardando = false;
    }, 1000);
  }

  getBadgeClass(stock: number, stockMinimo: number): string {
    if (stock === 0) return 'badge-danger';
    if (stock <= stockMinimo) return 'badge-warning';
    return 'badge-success';
  }

  exportarExcel() {
    this.mostrarToast('Exportando catálogo a Excel...', 'success');
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'warning' | 'error') {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  // Se dispara automáticamente por ngModel (o se puede llamar en un (input))
  filtrarProductos() {
    if (!this.searchTerm) {
      this.productosFiltrados = [...this.productosOriginales];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.productosFiltrados = this.productosOriginales.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.codigo.toLowerCase().includes(term)
    );
  }
}
