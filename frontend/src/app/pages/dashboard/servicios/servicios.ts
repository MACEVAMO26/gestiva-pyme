import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.scss',
})
export class Servicios implements OnInit {
  // --- TABS ---
  activeTab: string = 'recepcion'; // recepcion | agenda | ejecucion | catalogo | rendimiento

  // --- MOCK DB: CATÁLOGO ---
  catalogo: any[] = [];

  // --- MOCK DB: TICKETS / SOLICITUDES ---
  tickets: any[] = [];

  // --- MOCK DB: TÉCNICOS Y RENDIMIENTO ---
  tecnicos: any[] = [];

  // --- INVENTARIO (SIMULADO PARA DESCUENTO) ---
  inventario: any[] = [];

  // --- ESTADOS GLOBALES ---
  guardando = false;
  showToast = false;
  toastMessage = '';
  toastType = '';

  // Formularios Temporales
  formTicket = { cliente: '', servicio: '', fecha: '', hora: '', direccion: '' };
  modalAsignacion = false;
  ticketSeleccionado: any = null;
  tecnicoSeleccionado = '';
  
  modalEjecucion = false;
  materialSeleccionado = '';
  cantidadMaterial = 1;
  materialesUsados: any[] = [];
  
  tecnicoDashboard: any = null; // Por defecto el primero

  ngOnInit(): void {}

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  // --- TAB: RECEPCIÓN (TICKETS) ---
  crearTicket() {
    if(!this.formTicket.cliente || !this.formTicket.servicio) {
      this.mostrarToast('Cliente y Servicio son obligatorios', 'warning');
      return;
    }
    this.guardando = true;
    setTimeout(() => {
      this.tickets.unshift({
        id: this.tickets.length + 1,
        consecutivo: `TK-100${this.tickets.length + 1}`,
        cliente: this.formTicket.cliente,
        servicio: this.formTicket.servicio,
        fechaSol: this.formTicket.fecha || 'Por definir',
        horaSol: this.formTicket.hora || 'Por definir',
        estado: 'Pendiente',
        tecnico: null,
        direccion: this.formTicket.direccion
      });
      this.guardando = false;
      this.formTicket = { cliente: '', servicio: '', fecha: '', hora: '', direccion: '' };
      this.mostrarToast('Ticket de servicio creado exitosamente', 'success');
    }, 800);
  }

  // --- TAB: AGENDA Y DESPACHO ---
  get ticketsPendientes() {
    return this.tickets.filter(t => t.estado === 'Pendiente' || t.estado === 'Asignado');
  }

  abrirAsignacion(ticket: any) {
    this.ticketSeleccionado = ticket;
    this.tecnicoSeleccionado = ticket.tecnico || '';
    this.modalAsignacion = true;
  }

  cerrarAsignacion() {
    this.modalAsignacion = false;
    this.ticketSeleccionado = null;
  }

  guardarAsignacion() {
    if(!this.tecnicoSeleccionado) return;
    this.guardando = true;
    setTimeout(() => {
      this.ticketSeleccionado.tecnico = this.tecnicoSeleccionado;
      this.ticketSeleccionado.estado = 'Asignado';
      this.guardando = false;
      this.cerrarAsignacion();
      this.mostrarToast('Técnico asignado al servicio correctamente', 'success');
    }, 800);
  }

  // --- TAB: EJECUCIÓN Y MATERIALES ---
  abrirEjecucion(ticket: any) {
    this.ticketSeleccionado = ticket;
    this.materialesUsados = [];
    this.modalEjecucion = true;
  }

  cerrarEjecucion() {
    this.modalEjecucion = false;
    this.ticketSeleccionado = null;
  }

  agregarMaterial() {
    if(!this.materialSeleccionado || this.cantidadMaterial < 1) return;
    const inv = this.inventario.find(i => i.nombre === this.materialSeleccionado);
    if(inv) {
      if(inv.stock < this.cantidadMaterial) {
        this.mostrarToast(`Stock insuficiente. Solo hay ${inv.stock} en inventario.`, 'error');
        return;
      }
      this.materialesUsados.push({ nombre: inv.nombre, cantidad: this.cantidadMaterial, id: inv.id });
      this.materialSeleccionado = '';
      this.cantidadMaterial = 1;
    }
  }

  finalizarServicio() {
    this.guardando = true;
    setTimeout(() => {
      // Descontar inventario (Cascada)
      this.materialesUsados.forEach(mat => {
        const item = this.inventario.find(i => i.id === mat.id);
        if(item) item.stock -= mat.cantidad;
      });

      this.ticketSeleccionado.estado = 'Finalizado';
      this.guardando = false;
      this.cerrarEjecucion();
      this.mostrarToast('Servicio finalizado e inventario descontado con éxito', 'success');
    }, 1200);
  }

  // --- TAB: RENDIMIENTO ---
  seleccionarTecnicoRender(tec: any) {
    this.tecnicoDashboard = tec;
  }

  getPorcentaje(valor: number, max: number = 100) {
    return (valor / max) * 100;
  }

  // --- UTILIDADES ---
  getBadgeEstado(estado: string) {
    switch(estado) {
      case 'Pendiente': return 'badge-warning';
      case 'Asignado': return 'badge-secondary';
      case 'En Sitio': return 'badge-info';
      case 'Finalizado': return 'badge-success';
      case 'Cancelado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  mostrarToast(mensaje: string, tipo: string) {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 4000);
  }
}
