import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto, Categoria } from '../../../../../services/producto.service';
import { InventarioService, Inventario, MovimientoInventario } from '../../../../../services/inventario.service';
import { ToastService } from '../../../../../services/toast.service';

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

  tabActiva: 'catalogo' | 'existencias' | 'movimientos' = 'catalogo';

  categorias: Categoria[] = [];
  productos: Producto[] = [];
  inventarios: Inventario[] = [];
  movimientos: MovimientoInventario[] = [];
  
  cargando = false;

  nuevaCategoria: Categoria = { nombre: '', descripcion: '', tipo: 'producto', activo: true };
  nuevoProducto: Producto = { categoria_id: 0, nombre: '', descripcion: '', precio_compra: 0, precio_venta: 0, stock_inicial: 0, unidad_medida: 'UNIDAD', activo: true };
  nuevoMovimiento: MovimientoInventario = { inventario_id: 0, tipo_movimiento: 'entrada', cantidad: 1, observaciones: '' };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.productoService.getCategorias().subscribe(res => this.categorias = res);
    this.productoService.getProductos().subscribe(res => this.productos = res);
    this.inventarioService.getInventario().subscribe(res => this.inventarios = res);
    this.inventarioService.getMovimientos().subscribe(res => {
      this.movimientos = res;
      this.cargando = false;
    });
  }

  cambiarTab(tab: 'catalogo' | 'existencias' | 'movimientos') {
    this.tabActiva = tab;
  }

  guardarCategoria() {
    if (!this.nuevaCategoria.nombre) return this.toast.warning('El nombre es obligatorio');
    this.productoService.crearCategoria(this.nuevaCategoria).subscribe({
      next: () => {
        this.toast.success('Categoría creada');
        this.nuevaCategoria = { nombre: '', descripcion: '', tipo: 'producto', activo: true };
        this.cargarDatos();
      },
      error: () => this.toast.error('Error al crear categoría')
    });
  }

  guardarProducto() {
    if (!this.nuevoProducto.nombre || !this.nuevoProducto.categoria_id) return this.toast.warning('Nombre y Categoría obligatorios');
    this.productoService.crearProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.toast.success('Producto creado');
        this.nuevoProducto = { categoria_id: 0, nombre: '', descripcion: '', precio_compra: 0, precio_venta: 0, stock_inicial: 0, unidad_medida: 'UNIDAD', activo: true };
        this.cargarDatos();
      },
      error: () => this.toast.error('Error al crear producto')
    });
  }

  registrarMovimiento() {
    if (!this.nuevoMovimiento.inventario_id || this.nuevoMovimiento.cantidad <= 0) return this.toast.warning('Datos de movimiento inválidos');
    this.inventarioService.registrarMovimiento(this.nuevoMovimiento).subscribe({
      next: () => {
        this.toast.success('Movimiento registrado con éxito');
        this.nuevoMovimiento = { inventario_id: 0, tipo_movimiento: 'entrada', cantidad: 1, observaciones: '' };
        this.cargarDatos();
      },
      error: () => this.toast.error('Error al registrar movimiento')
    });
  }
}
