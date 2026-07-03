import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  AccessibilityService,
  DaltonismMode,
} from '../../services/accessibility/accessibility.service';
import { EmpresaService } from '../../services/empresa.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ModulosService } from '../../services/modulos.service';

@Component({
  selector: 'app-saas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saas-admin.component.html',
  styleUrls: ['./saas-admin.component.scss'],
})
export class SaasAdminComponent implements OnInit {
  user: any = null;
  public accessibilityService = inject(AccessibilityService);
  private empresaService = inject(EmpresaService);
  private cdr = inject(ChangeDetectorRef);
  isAccessibilityMenuOpen = false;

  empresas: any[] = [];
  empresasEnMora: number = 0;
  empresaDestacadaId: number | null = null;
  showModal = false;
  showSuccessModal = false;
  createdAdminEmail = '';
  toastMessage: string | null = null;

  isEditMode = false;
  editingId: number | null = null;
  isSubmitting: boolean = false;

  nuevaEmpresa = {
    razon_social: '',
    nit: '',
    tipo_empresa: 'Servicios', // Default
  };

  // Vistas y Solicitudes
  currentView = 'dashboard';
  solicitudes: any[] = [];
  solicitudesPendientes: number = 0;

  // Módulos (Mock Data)
  paquetesModulos = [
    {
      id: 'ventas',
      nombre: 'Paquete VENTAS',
      descripcion: 'Para comercios y tiendas de productos físicos.',
      icono: 'fas fa-shopping-cart',
      color: 'blue',
      activo: true,
      submodulos: [
        { id: 'v_pos', nombre: 'Interfaz de Venta Rápida (POS)', activo: true },
        { id: 'v_inv', nombre: 'Inventario y Alertas', activo: true },
        { id: 'v_cxc', nombre: 'Cuentas por Cobrar (Cartera)', activo: true },
        { id: 'v_rep', nombre: 'Reportes de Ventas', activo: true },
      ],
    },
    {
      id: 'servicios',
      nombre: 'Paquete SERVICIOS',
      descripcion: 'Para agendas, barberías, consultorios y talleres.',
      icono: 'fas fa-calendar-alt',
      color: 'purple',
      activo: true,
      submodulos: [
        { id: 's_age', nombre: 'Agenda y Calendario', activo: true },
        { id: 's_crm', nombre: 'CRM (Gestión de Clientes)', activo: true },
        { id: 's_cat', nombre: 'Catálogo de Servicios', activo: true },
      ],
    },
    {
      id: 'finanzas',
      nombre: 'Transversal: Caja y Facturación',
      descripcion: 'Registro de pagos y cobro por servicios o productos.',
      icono: 'fas fa-cash-register',
      color: 'yellow',
      activo: true,
      submodulos: [{ id: 'f_caja', nombre: 'Caja y Pre-facturación', activo: true }],
    },
    {
      id: 'rrhh',
      nombre: 'Transversal: RRHH (Personal)',
      descripcion: 'Gestión de empleados, turnos y vacaciones. Disponible para todos.',
      icono: 'fas fa-users',
      color: 'indigo',
      activo: true,
      submodulos: [
        { id: 'r_tur', nombre: 'Horarios y Turnos', activo: true },
        { id: 'r_aus', nombre: 'Control de Horas Extras y Ausencias', activo: true },
        { id: 'r_vac', nombre: 'Gestión de Vacaciones', activo: true },
      ],
    },
    {
      id: 'addons',
      nombre: 'Módulos Adicionales (Add-ons)',
      descripcion: 'Conectores y herramientas extra que se cobran por separado.',
      icono: 'fas fa-plug',
      color: 'green',
      activo: true,
      submodulos: [
        { id: 'a_helisa', nombre: 'Conector Contable (Helisa)', activo: false }, // Inactivo por defecto/mantenimiento
      ],
    },
  ];

  // Suscripciones
  statsSuscripciones = {
    mrr: 0,
    clientesActivos: 0,
    clientesMora: 0,
    crecimientoMensual: 0,
  };

  suscripcionesList: any[] = [];

  // Monitor de Estado
  serverStatus = {
    generalUptime: '99.9%',
    dbConnection: 'Estable',
    lastBackup: 'Hace 2 horas',
    lastActivity: 'Desconocida',
  };

  empresaSeleccionadaId: string | null = null;

  // Comercial
  comercialTab: 'interesados' | 'correos' = 'interesados';
  leads: any[] = [];

  debugError: string | null = null;

  // Modales y Menú
  isSidebarCollapsed = false;
  isModalSolicitudOpen = false;
  solicitudSeleccionada: any = null;
  mensajeRespuesta: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private modulosService: ModulosService,
  ) {}

  ngOnInit(): void {
    const savedView = localStorage.getItem('saas_current_view');
    if (savedView) {
      this.currentView = savedView;
    }

    this.user = this.authService.getUser();
    // Protege la ruta exclusiva
    if (this.user && this.user.empresa_id !== null) {
      this.router.navigate(['/dashboard']);
    }

    this.cargarEmpresas();
    this.cargarSolicitudes();
    this.cargarLeads();
    this.cargarSuscripciones();
    this.cargarSystemStats();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  cambiarVista(vista: string) {
    this.currentView = vista;
    localStorage.setItem('saas_current_view', vista);
    if (vista === 'comercial') {
      this.cargarLeads();
    }
  }

  setComercialTab(tab: 'interesados' | 'correos') {
    this.comercialTab = tab;
  }

  cargarLeads() {
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
      this.debugError = 'NO HAY TOKEN DE SESIÓN EN LOCALSTORAGE.';
      this.cdr.detectChanges();
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    const t = new Date().getTime();
    this.http.get<any[]>(`http://127.0.0.1:8000/api/leads?t=${t}`, { headers }).subscribe({
      next: (data) => {
        this.leads = [...data];
        if (this.leads.length === 0) {
          this.debugError = 'Backend devolvió 0 leads. Data real: ' + JSON.stringify(data);
        } else {
          this.debugError = 'Exito: ' + this.leads.length + ' leads cargados.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.debugError = 'Error cargando leads: ' + err.message;
        this.cdr.detectChanges();
      },
    });
  }

  cambiarEstadoLead(id: number, nuevoEstado: string) {
    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    this.http
      .patch(`http://127.0.0.1:8000/api/leads/${id}`, { estado: nuevoEstado }, { headers })
      .subscribe({
        next: () => {
          this.cargarLeads();
        },
        error: () => alert('Error al actualizar estado del interesado.'),
      });
  }

  eliminarLead(id: number) {
    if (
      !confirm('¿Estás seguro de que deseas eliminar este lead? Esta acción no se puede deshacer.')
    )
      return;

    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.delete(`http://127.0.0.1:8000/api/leads/${id}`, { headers }).subscribe({
      next: () => {
        this.cargarLeads();
      },
      error: () => alert('Error al eliminar el lead.'),
    });
  }

  cargarSolicitudes() {
    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>('http://127.0.0.1:8000/api/admin-requests', { headers }).subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.solicitudesPendientes = data.filter((s: any) => s.estado === 'pendiente').length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar solicitudes', err),
    });
  }

  abrirSolicitud(solicitud: any) {
    this.solicitudSeleccionada = solicitud;
    this.mensajeRespuesta = '';
    this.isModalSolicitudOpen = true;
  }

  cerrarModalSolicitud() {
    this.isModalSolicitudOpen = false;
    this.solicitudSeleccionada = null;
  }

  procesarSolicitud(accion: string) {
    if (accion === 'rechazado' && !this.mensajeRespuesta) {
      alert('Debes ingresar un motivo en caso de rechazo.');
      return;
    }

    if (!this.solicitudSeleccionada) return;

    const empresaId = this.solicitudSeleccionada.empresa_id;

    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    const body = {
      accion: accion,
      mensaje: this.mensajeRespuesta,
    };

    this.http
      .patch(
        `http://127.0.0.1:8000/api/admin-requests/${this.solicitudSeleccionada.id}/process`,
        body,
        { headers },
      )
      .subscribe({
        next: () => {
          this.showSuccessModal = true;
          this.isModalSolicitudOpen = false;
          this.solicitudSeleccionada = null;
          this.mensajeRespuesta = '';
          this.cargarSolicitudes();
          this.cargarEmpresas();

          if (accion === 'aprobado') {
            this.currentView = 'empresas';
            this.empresaDestacadaId = empresaId;
            setTimeout(() => {
              this.empresaDestacadaId = null;
            }, 10000);
          }
        },
        error: () => alert('Error al procesar solicitud.'),
      });
  }

  cargarEmpresas() {
    this.empresaService.getEmpresas().subscribe({
      next: (data) => {
        this.empresas = data;
        this.empresasEnMora = data.filter((e: any) => e.activo && e.estado_pago === 'mora').length;
        this.cdr.detectChanges(); // Forzar actualización de UI
      },
      error: (err) => console.error('Error al cargar:', err),
    });
  }

  cargarSuscripciones() {
    this.empresaService.getSuscripcionesStats().subscribe({
      next: (data) => {
        this.statsSuscripciones = data.stats;
        this.suscripcionesList = data.lista;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar suscripciones:', err),
    });
  }

  cargarSystemStats() {
    this.empresaService.getSystemStats().subscribe({
      next: (data) => {
        this.serverStatus = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar system stats:', err),
    });
  }

  abrirModal() {
    this.isEditMode = false;
    this.editingId = null;
    this.nuevaEmpresa = { razon_social: '', nit: '', tipo_empresa: 'Servicios' };
    this.showModal = true;
  }

  editarEmpresa(empresa: any) {
    this.isEditMode = true;
    this.editingId = empresa.id;
    this.nuevaEmpresa = {
      razon_social: empresa.razon_social,
      nit: empresa.nit,
      tipo_empresa: empresa.tipo_empresa,
    };
    this.showModal = true;
  }

  toggleSubmodulo(paqueteId: string, submoduloId: string) {
    if (!this.empresaSeleccionadaId) {
      alert('Por favor selecciona una empresa primero.');
      return;
    }
    const paquete = this.paquetesModulos.find((p) => p.id === paqueteId);
    if (paquete) {
      const sub = paquete.submodulos.find((s) => s.id === submoduloId);
      if (sub) {
        sub.activo = !sub.activo;
        paquete.activo = paquete.submodulos.some((s) => s.activo); // Sincronizar
      }
    }
  }

  togglePaqueteCompleto(paqueteId: string, activar: boolean) {
    if (!this.empresaSeleccionadaId) {
      alert('Por favor selecciona una empresa primero.');
      return;
    }
    const paquete = this.paquetesModulos.find((p) => p.id === paqueteId);
    if (paquete) {
      paquete.activo = activar; // FIX: Actualizar el master toggle
      paquete.submodulos.forEach((sub) => {
        if (sub.activo !== activar) {
          sub.activo = activar;
        }
      });
    }
  }

  guardarPaquete(paqueteId: string) {
    if (!this.empresaSeleccionadaId) {
      alert('Por favor selecciona una empresa primero.');
      return;
    }
    const paquete = this.paquetesModulos.find((p) => p.id === paqueteId);
    if (paquete) {
      const modulosState = paquete.submodulos.map(sub => ({
        id: sub.id,
        activo: sub.activo
      }));

      this.modulosService.updatePaqueteEmpresa(this.empresaSeleccionadaId, modulosState).subscribe({
        next: (res) => {
          console.log(`Paquete ${paquete.nombre} actualizado masivamente`, res);
          this.toastMessage = `¡Los cambios al paquete ${paquete.nombre} se han guardado correctamente!`;
          setTimeout(() => {
            this.toastMessage = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error al actualizar paquete masivamente', err);
          this.toastMessage = 'Error al guardar el paquete en el servidor.';
          setTimeout(() => {
            this.toastMessage = null;
          }, 3000);
        }
      });
    }
  }

  seleccionarEmpresaModulos(event: any) {
    this.empresaSeleccionadaId = event.target.value;
    console.log('Empresa seleccionada para módulos:', this.empresaSeleccionadaId);
    if (this.empresaSeleccionadaId) {
      this.cargarModulosDeEmpresa(this.empresaSeleccionadaId);
    }
  }

  cargarModulosDeEmpresa(empresaId: string) {
    this.modulosService.getModulosPorEmpresa(empresaId).subscribe({
      next: (res) => {
        console.log('Módulos de la empresa obtenidos:', res);
        this.actualizarUIModulos(res.modulos);
      },
      error: (err) => {
        console.error('Error al obtener los módulos de la empresa', err);
      },
    });
  }

  actualizarUIModulos(modulosBD: any) {
    // Recorremos los paquetes (ventas, servicios, etc.)
    Object.keys(modulosBD).forEach((paqueteClave) => {
      // paqueteClave ej: 'ventas'
      // Buscamos el paquete correspondiente en la UI (puede estar en mayúsculas o ser diferente)
      const paqueteUI = this.paquetesModulos.find(
        (p) => p.nombre.toLowerCase().includes(paqueteClave) || p.id === paqueteClave,
      );
      if (paqueteUI) {
        const subsDB = modulosBD[paqueteClave]; // array de submódulos
        // Actualizamos o añadimos a la UI
        paqueteUI.submodulos = subsDB.map((s: any) => ({
          id: s.id,
          nombre: s.nombre,
          activo: s.activo,
        }));

        // Sincronizar el master toggle basado en si los submódulos están activos
        paqueteUI.activo = paqueteUI.submodulos.some((s) => s.activo);
      }
    });
    this.cdr.detectChanges();
  }

  cerrarSesionLocal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.editingId = null;
    this.nuevaEmpresa = { razon_social: '', nit: '', tipo_empresa: 'Servicios' };
  }

  cerrarModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.editingId = null;
    this.nuevaEmpresa = { razon_social: '', nit: '', tipo_empresa: 'Servicios' };
  }

  cerrarSuccessModal() {
    this.showSuccessModal = false;
  }

  guardarEmpresa() {
    if (this.isEditMode && this.editingId) {
      // Editar
      this.empresaService.updateEmpresa(this.editingId, this.nuevaEmpresa).subscribe({
        next: () => {
          this.cargarEmpresas();
          this.cerrarModal();
        },
        error: (err) => alert('Error al actualizar la empresa.'),
      });
    } else {
      // Crear
      this.empresaService.createEmpresa(this.nuevaEmpresa).subscribe({
        next: (response) => {
          this.createdAdminEmail = response.admin_email;
          this.showSuccessModal = true;
          this.cargarEmpresas();
          this.cerrarModal();
        },
        error: (err) => alert('Error al crear la empresa. Revisa los datos (ej. NIT duplicado).'),
      });
    }
  }

  cambiarEstadoEmpresa(empresa: any, accion: string) {
    let msg = '';
    if (accion === 'mora') msg = 'inactivar parcialmente (Mora)';
    if (accion === 'inactivar') msg = 'inactivar totalmente';
    if (accion === 'activar') msg = 'activar';

    if (confirm(`¿Estás seguro de ${msg} a la empresa ${empresa.razon_social}?`)) {
      this.empresaService.toggleStatus(empresa.id, accion).subscribe({
        next: () => {
          this.cargarEmpresas();
          this.empresaDestacadaId = null;
        },
        error: () => alert('Error al cambiar el estado de la empresa.'),
      });
    }
  }

  toggleAccessibilityMenu() {
    this.isAccessibilityMenuOpen = !this.isAccessibilityMenuOpen;
  }

  setDaltonismMode(mode: DaltonismMode) {
    this.accessibilityService.setMode(mode);
    this.isAccessibilityMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
