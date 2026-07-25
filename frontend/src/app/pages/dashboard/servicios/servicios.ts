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
  catalogo = [
    { id: 1, codigo: 'SRV-001', nombre: 'Mantenimiento Preventivo', tarifaBase: 50000, duracionEst: '2h' },
    { id: 2, codigo: 'SRV-002', nombre: 'Instalación de Red / Cableado', tarifaBase: 120000, duracionEst: '4h' },
    { id: 3, codigo: 'SRV-003', nombre: 'Diagnóstico a Domicilio', tarifaBase: 35000, duracionEst: '1h' }
  ];

  // --- MOCK DB: TICKETS / SOLICITUDES ---
  tickets = [
    { id: 1, consecutivo: 'TK-1001', cliente: 'María López', servicio: 'Mantenimiento Preventivo', fechaSol: '26/07/2026', horaSol: '09:00', estado: 'Asignado', tecnico: 'Carlos Ruiz', direccion: 'Calle Falsa 123' },
    { id: 2, consecutivo: 'TK-1002', cliente: 'Empresa ABC', servicio: 'Instalación de Red', fechaSol: '26/07/2026', horaSol: '14:00', estado: 'Pendiente', tecnico: null, direccion: 'Av Central 45' },
    { id: 3, consecutivo: 'TK-1003', cliente: 'Juan Pérez', servicio: 'Diagnóstico', fechaSol: '25/07/2026', horaSol: '10:00', estado: 'Finalizado', tecnico: 'Ana Gómez', direccion: 'Carrera 8 #9-10' }
  ];

  // --- MOCK DB: TÉCNICOS Y RENDIMIENTO ---
  tecnicos = [
    { id: 1, nombre: 'Carlos Ruiz', rendimiento: { cumplidas: 85, satisfactorias: 80, quejas: 2 } },
    { id: 2, nombre: 'Ana Gómez', rendimiento: { cumplidas: 95, satisfactorias: 93, quejas: 0 } },
    { id: 3, nombre: 'Luis Martínez', rendimiento: { cumplidas: 60, satisfactorias: 50, quejas: 5 } }
  ];

  // --- INVENTARIO (SIMULADO PARA DESCUENTO) ---
  inventario = [
    { id: 1, nombre: 'Cable UTP (Metros)', stock: 500 },
    { id: 2, nombre: 'Conector RJ45', stock: 150 },
    { id: 3, nombre: 'Disco Duro SSD 500GB', stock: 10 }
  ];

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
  
  tecnicoDashboard = this.tecnicos[0]; // Por defecto el primero

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
