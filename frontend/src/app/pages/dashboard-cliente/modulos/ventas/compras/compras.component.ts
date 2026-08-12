import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraService, OrdenCompra, Recepcion } from '../../../../../services/compra.service';
import { CuentasPagarService, CuentaPorPagar } from '../../../../../services/cuentas-pagar.service';
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
  private cuentasService = inject(CuentasPagarService);
  private proveedorService = inject(ProveedorService);
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);

  tabActiva: 'ordenes' | 'recepciones' | 'cuentas' = 'ordenes';
  cargando = false;

  proveedores: Proveedor[] = [];
  productos: Producto[] = [];
  
  ordenes: OrdenCompra[] = [];
  recepciones: Recepcion[] = [];
  cuentas: CuentaPorPagar[] = [];

  nuevaOrden: OrdenCompra = { proveedor_id: 0, estado: 'borrador', total: 0, detalles: [] };
  itemTemporal: { producto_id: number; cantidad: number; precio_unitario: number } = { producto_id: 0, cantidad: 1, precio_unitario: 0 };

  ngOnInit() {
    this.cargarDatos();
  }

  cambiarTab(tab: 'ordenes' | 'recepciones' | 'cuentas') {
    this.tabActiva = tab;
  }

  cargarDatos() {
    this.cargando = true;
    this.proveedorService.getProveedores().subscribe(res => this.proveedores = res);
    this.productoService.getProductos().subscribe(res => this.productos = res);
    this.compraService.getOrdenes().subscribe(res => this.ordenes = res);
    this.compraService.getRecepciones().subscribe(res => this.recepciones = res);
    this.cuentasService.getCuentas().subscribe(res => {
      this.cuentas = res;
      this.cargando = false;
    });
  }

  agregarDetalleOrden() {
    if (!this.itemTemporal.producto_id || this.itemTemporal.cantidad <= 0 || this.itemTemporal.precio_unitario <= 0) {
      return this.toast.warning('Datos inválidos para el producto');
    }
    const subtotal = this.itemTemporal.cantidad * this.itemTemporal.precio_unitario;
    this.nuevaOrden.detalles!.push({ ...this.itemTemporal, subtotal });
    this.nuevaOrden.total += subtotal;
    
    // Reset temporal
    this.itemTemporal = { producto_id: 0, cantidad: 1, precio_unitario: 0 };
  }

  guardarOrden() {
    if (!this.nuevaOrden.proveedor_id || this.nuevaOrden.detalles!.length === 0) {
      return this.toast.warning('Seleccione un proveedor y agregue productos');
    }
    
    this.compraService.crearOrden(this.nuevaOrden).subscribe({
      next: () => {
        this.toast.success('Orden de Compra Creada');
        this.nuevaOrden = { proveedor_id: 0, estado: 'borrador', total: 0, detalles: [] };
        this.cargarDatos();
      },
      error: () => this.toast.error('Error al crear orden')
    });
  }
}
