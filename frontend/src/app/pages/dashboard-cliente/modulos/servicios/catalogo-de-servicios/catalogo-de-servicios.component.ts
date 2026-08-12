import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalogo-de-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo-de-servicios.component.html',
  styleUrl: './catalogo-de-servicios.component.scss'
})
export class CatalogoDeServiciosComponent implements OnInit {
  activeTab: string = 'recepcion';
  guardando: boolean = false;

  // Recepción
  formTicket: any = { cliente: '', servicio: '', fecha: '', hora: '', direccion: '' };
  
  catalogo: any[] = [];
  tickets: any[] = [];
  ticketsPendientes: any[] = [];
  
  // Rendimiento Técnico
  tecnicos: any[] = [];
  tecnicoDashboard: any = null;

  // Asignación
  modalAsignacion: boolean = false;
  ticketSeleccionado: any = null;
  tecnicoSeleccionado: string = '';

  // Ejecución / Materiales
  modalEjecucion: boolean = false;
  inventario: any[] = [];
  materialSeleccionado: string = '';
  cantidadMaterial: number = 1;
  materialesUsados: any[] = [];

  // Toast
  showToast: boolean = false;
  toastType: string = 'success';
  toastMessage: string = '';

  ngOnInit() {
    this.cargarDatosDemo();
  }

  cargarDatosDemo() {
    this.catalogo = [
      { id: 1, codigo: 'SERV-001', nombre: 'Mantenimiento Preventivo', duracionEst: '2 horas', tarifaBase: 150000 },
      { id: 2, codigo: 'SERV-002', nombre: 'Reparación de Equipos', duracionEst: '4 horas', tarifaBase: 350000 },
      { id: 3, codigo: 'SERV-003', nombre: 'Instalación Básica', duracionEst: '1 hora', tarifaBase: 80000 }
    ];

    this.tickets = [
      { id: 1, consecutivo: 'TK-1001', cliente: 'Clínica San José', servicio: 'Mantenimiento Preventivo', estado: 'Completado', tecnico: 'Juan Pérez' },
      { id: 2, consecutivo: 'TK-1002', cliente: 'Industrias XYZ', servicio: 'Reparación de Equipos', estado: 'Pendiente', tecnico: '', direccion: 'Calle 100 #45-12', fechaSol: '2023-11-20', horaSol: '14:00' },
      { id: 3, consecutivo: 'TK-1003', cliente: 'Supermercado Central', servicio: 'Instalación Básica', estado: 'Asignado', tecnico: 'María Gómez', direccion: 'Carrera 50 #30-10', fechaSol: '2023-11-21', horaSol: '09:00' },
      { id: 4, consecutivo: 'TK-1004', cliente: 'Hotel del Mar', servicio: 'Mantenimiento Preventivo', estado: 'En Sitio', tecnico: 'Juan Pérez', direccion: 'Avenida 1 #2-3', fechaSol: '2023-11-22', horaSol: '10:00' }
    ];

    this.tecnicos = [
      { id: 1, nombre: 'Juan Pérez', rendimiento: { cumplidas: 85, satisfactorias: 80, quejas: 2 } },
      { id: 2, nombre: 'María Gómez', rendimiento: { cumplidas: 95, satisfactorias: 94, quejas: 1 } },
      { id: 3, nombre: 'Carlos Ruiz', rendimiento: { cumplidas: 60, satisfactorias: 50, quejas: 10 } }
    ];

    this.inventario = [
      { id: 1, nombre: 'Cable UTP (Metros)', stock: 500 },
      { id: 2, nombre: 'Router WiFi', stock: 50 },
      { id: 3, nombre: 'Conector RJ45', stock: 1000 }
    ];

    this.filtrarTicketsPendientes();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  crearTicket() {
    this.guardando = true;
    setTimeout(() => {
      const nuevoId = this.tickets.length + 1;
      this.tickets.push({
        id: nuevoId,
        consecutivo: `TK-100${nuevoId}`,
        cliente: this.formTicket.cliente,
        servicio: this.formTicket.servicio,
        estado: 'Pendiente',
        tecnico: '',
        direccion: this.formTicket.direccion,
        fechaSol: this.formTicket.fecha,
        horaSol: this.formTicket.hora
      });
      this.filtrarTicketsPendientes();
      this.mostrarToast('success', 'Ticket creado exitosamente');
      this.formTicket = { cliente: '', servicio: '', fecha: '', hora: '', direccion: '' };
      this.guardando = false;
    }, 800);
  }

  filtrarTicketsPendientes() {
    this.ticketsPendientes = this.tickets.filter(t => t.estado === 'Pendiente');
  }

  getBadgeEstado(estado: string): string {
    switch (estado) {
      case 'Completado': return 'badge-success';
      case 'Pendiente': return 'badge-warning';
      case 'Asignado': return 'badge-primary';
      case 'En Sitio': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  // --- ASIGNACION ---
  abrirAsignacion(tk: any) {
    this.ticketSeleccionado = tk;
    this.tecnicoSeleccionado = '';
    this.modalAsignacion = true;
  }

  cerrarAsignacion() {
    this.modalAsignacion = false;
    this.ticketSeleccionado = null;
  }

  guardarAsignacion() {
    this.guardando = true;
    setTimeout(() => {
      if (this.ticketSeleccionado) {
        this.ticketSeleccionado.tecnico = this.tecnicoSeleccionado;
        this.ticketSeleccionado.estado = 'Asignado';
        this.filtrarTicketsPendientes();
        this.mostrarToast('success', 'Técnico despachado exitosamente');
      }
      this.cerrarAsignacion();
      this.guardando = false;
    }, 800);
  }

  // --- EJECUCION ---
  abrirEjecucion(tk: any) {
    this.ticketSeleccionado = tk;
    this.materialSeleccionado = '';
    this.cantidadMaterial = 1;
    this.materialesUsados = [];
    this.modalEjecucion = true;
  }

  cerrarEjecucion() {
    this.modalEjecucion = false;
    this.ticketSeleccionado = null;
  }

  agregarMaterial() {
    if (this.materialSeleccionado && this.cantidadMaterial > 0) {
      const mat = this.inventario.find(i => i.nombre === this.materialSeleccionado);
      if (mat) {
        this.materialesUsados.push({
          id: Math.random(),
          nombre: mat.nombre,
          cantidad: this.cantidadMaterial
        });
        this.materialSeleccionado = '';
        this.cantidadMaterial = 1;
      }
    }
  }

  finalizarServicio() {
    this.guardando = true;
    setTimeout(() => {
      if (this.ticketSeleccionado) {
        this.ticketSeleccionado.estado = 'Completado';
        this.mostrarToast('success', 'Servicio cerrado. Materiales descontados.');
      }
      this.cerrarEjecucion();
      this.guardando = false;
    }, 800);
  }

  // --- RENDIMIENTO ---
  seleccionarTecnicoRender(tec: any) {
    this.tecnicoDashboard = tec;
  }

  getPorcentaje(valor: number, total: number = 100): number {
    return Math.min(Math.round((valor / total) * 100), 100);
  }

  // --- TOAST ---
  mostrarToast(type: string, message: string) {
    this.toastType = type;
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
