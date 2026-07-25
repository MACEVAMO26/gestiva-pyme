import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras.html',
  styleUrl: './compras.scss',
})
export class Compras implements OnInit {
  // --- TABS ---
  activeTab: string = 'ordenes'; // ordenes | recepcion

  // --- VARIABLES DE ESTADO ---
  showModalOrden = false;
  showModalRecepcion = false;
  searchTerm = '';

  // --- DATOS MOCK ---
  ordenes = [
    { id: 1, numero: 'OC-2026-001', proveedor: 'Distribuidora Tecnológica S.A.', fecha: '25/07/2026', total: 4500000, estado: 'Pendiente' },
    { id: 2, numero: 'OC-2026-002', proveedor: 'Suministros Globales', fecha: '23/07/2026', total: 850000, estado: 'Recibido' },
    { id: 3, numero: 'OC-2026-003', proveedor: 'Papelería Central', fecha: '20/07/2026', total: 120000, estado: 'Anulado' }
  ];

  // --- FORMULARIO ORDEN ---
  formOrden = {
    proveedor: '',
    fechaEsperada: '',
    observaciones: '',
    total: 0
  };

  // --- TOAST/ALERTAS ---
  toastMessage = '';
  toastType = ''; // 'success' | 'error' | 'warning'
  showToast = false;
  guardando = false;

  ngOnInit(): void {}

  // --- NAVEGACION ---
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // --- MODALES ---
  abrirModalOrden() {
    this.formOrden = { proveedor: '', fechaEsperada: '', observaciones: '', total: 0 };
    this.showModalOrden = true;
  }

  cerrarModalOrden() {
    this.showModalOrden = false;
  }
  
  abrirModalRecepcion() {
    this.showModalRecepcion = true;
  }

  cerrarModalRecepcion() {
    this.showModalRecepcion = false;
  }

  // --- ACCIONES PRINCIPALES ---
  guardarOrden() {
    if (!this.formOrden.proveedor) {
      this.mostrarToast('Debe seleccionar un proveedor.', 'warning');
      return;
    }

    this.guardando = true;
    setTimeout(() => {
      const nueva = {
        id: this.ordenes.length + 1,
        numero: `OC-2026-00${this.ordenes.length + 1}`,
        proveedor: this.formOrden.proveedor,
        fecha: new Date().toLocaleDateString('es-CO'),
        total: this.formOrden.total,
        estado: 'Pendiente'
      };
      
      this.ordenes.unshift(nueva);
      this.cerrarModalOrden();
      this.guardando = false;
      this.mostrarToast('Orden de compra guardada con éxito', 'success');
    }, 800);
  }

  recibirOrden() {
    this.guardando = true;
    setTimeout(() => {
      this.cerrarModalRecepcion();
      this.guardando = false;
      this.mostrarToast('Recepción registrada en el inventario', 'success');
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
  get ordenesFiltradas() {
    if (!this.searchTerm) return this.ordenes;
    const term = this.searchTerm.toLowerCase();
    return this.ordenes.filter(o => 
      o.numero.toLowerCase().includes(term) || 
      o.proveedor.toLowerCase().includes(term) ||
      o.estado.toLowerCase().includes(term)
    );
  }

  getBadgeClass(estado: string) {
    switch(estado) {
      case 'Recibido': return 'badge-success';
      case 'Pendiente': return 'badge-warning';
      case 'Anulado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}
