import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
})
export class Inventario implements OnInit {
  // --- TABS ---
  activeTab: string = 'catalogo'; // catalogo | movimientos | ajustes | kardex

  // --- VARIABLES DE ESTADO ---
  showModal = false;
  searchTerm = '';

  // --- DATOS MOCK (Simulación) ---
  productos = [
    { id: 1, codigo: 'PRD-001', nombre: 'Laptop Dell Inspiron', categoria: 'Equipos', precio: 2500000, costo: 2000000, stock: 15, stockMinimo: 5, estado: 'Activo' },
    { id: 2, codigo: 'PRD-002', nombre: 'Mouse Inalámbrico Logitech', categoria: 'Accesorios', precio: 85000, costo: 50000, stock: 4, stockMinimo: 10, estado: 'Activo' },
    { id: 3, codigo: 'PRD-003', nombre: 'Monitor LG 24"', categoria: 'Equipos', precio: 650000, costo: 500000, stock: 0, stockMinimo: 2, estado: 'Inactivo' }
  ];

  // --- FORMULARIO NUEVO PRODUCTO ---
  formProducto = {
    codigo: '',
    nombre: '',
    categoria: '',
    precio: 0,
    costo: 0,
    stockMinimo: 0
  };

  // --- TOAST/ALERTAS ---
  toastMessage = '';
  toastType = ''; // 'success' | 'error' | 'warning'
  showToast = false;
  guardando = false;

  ngOnInit(): void {}

  // --- METODOS DE NAVEGACION ---
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // --- METODOS DE MODAL ---
  abrirModal() {
    this.formProducto = { codigo: '', nombre: '', categoria: '', precio: 0, costo: 0, stockMinimo: 0 };
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  // --- ACCIONES PRINCIPALES ---
  guardarProducto() {
    // Validaciones básicas
    if (!this.formProducto.codigo || !this.formProducto.nombre || !this.formProducto.categoria) {
      this.mostrarToast('Por favor completa los campos obligatorios.', 'warning');
      return;
    }

    this.guardando = true;

    // Simulando retraso de red
    setTimeout(() => {
      const nuevo = {
        id: this.productos.length + 1,
        ...this.formProducto,
        stock: 0,
        estado: 'Activo'
      };
      
      this.productos.push(nuevo);
      this.cerrarModal();
      this.guardando = false;
      this.mostrarToast('Producto guardado con éxito', 'success');
    }, 800);
  }

  mostrarToast(mensaje: string, tipo: string) {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }

  // --- FILTROS ---
  get productosFiltrados() {
    if (!this.searchTerm) return this.productos;
    const term = this.searchTerm.toLowerCase();
    return this.productos.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.codigo.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term)
    );
  }

  getBadgeClass(stock: number, minimo: number) {
    if (stock === 0) return 'badge-danger';
    if (stock <= minimo) return 'badge-warning';
    return 'badge-success';
  }
}
