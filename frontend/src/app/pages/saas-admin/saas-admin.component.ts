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
  showAddonModal = false;
  nombreNuevoAddon = '';
  editingAddonId: string | null = null;
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

  // Módulos
  paquetesModulos: any[] = [];

  // Suscripciones
  statsSuscripciones = {
    mrr: 0,
    clientesActivos: 0,
    clientesMora: 0,
    crecimientoMensual: 0,
  };

  suscripcionesList: any[] = [];

  // Monitor de Estado
  serverStatus: any = {
    status: 'online',
    generalUptime: '99.9%',
    dbConnection: 'Estable',

    lastBackup: 'Hace 2 horas',
    lastActivity: 'Desconocida',
  };

  empresaSeleccionadaId: string | null = null;

  // Comercial
  comercialTab: 'interesados' | 'correos' = 'interesados';
  leads: any[] = [];
  
  // Notas
  showNotasModal = false;
  leadSeleccionadoParaNotas: any = null;
  nuevaNotaTexto = '';

  abrirModalNotas(lead: any) {
    this.leadSeleccionadoParaNotas = lead;
    if (!this.leadSeleccionadoParaNotas.notas) {
      this.leadSeleccionadoParaNotas.notas = [];
    }
    // Filtrar notas caducadas (más de 90 días)
    const tresMesesAtras = new Date();
    tresMesesAtras.setDate(tresMesesAtras.getDate() - 90);
    this.leadSeleccionadoParaNotas.notas = this.leadSeleccionadoParaNotas.notas.filter((n: any) => new Date(n.fecha) > tresMesesAtras);
    
    this.showNotasModal = true;
  }

  cerrarModalNotas() {
    this.showNotasModal = false;
    this.leadSeleccionadoParaNotas = null;
    this.nuevaNotaTexto = '';
  }

  agregarNota() {
    if (!this.nuevaNotaTexto.trim()) return;
    
    const nuevaNota = {
      id: Date.now().toString(),
      texto: this.nuevaNotaTexto,
      fecha: new Date().toISOString()
    };

    this.leadSeleccionadoParaNotas.notas.unshift(nuevaNota);
    this.nuevaNotaTexto = '';
    this.guardarNotasEnBackend();
  }

  eliminarNota(notaId: string) {
    this.leadSeleccionadoParaNotas.notas = this.leadSeleccionadoParaNotas.notas.filter((n: any) => n.id !== notaId);
    this.guardarNotasEnBackend();
  }

  guardarNotasEnBackend() {
    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    this.http
      .patch(`http://127.0.0.1:8000/api/leads/${this.leadSeleccionadoParaNotas.id}`, { notas: this.leadSeleccionadoParaNotas.notas }, { headers })
      .subscribe({
        next: () => {},
        error: () => alert('Error al guardar la nota.')
      });
  }

  // Brevo
  asuntoBrevo: string = '';
  mensajeBrevo: string = '';
  isEnviandoBrevo: boolean = false;
  archivoAdjuntoBrevo: File | null = null;

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

    this.modulosService.getCatalogoModulos().subscribe(catalog => {
      this.paquetesModulos = catalog;
    });

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoAdjuntoBrevo = file;
    }
  }

  enviarCampanaBrevo() {
    if (!this.asuntoBrevo.trim() || !this.mensajeBrevo.trim()) {
      alert('El asunto y el mensaje son obligatorios.');
      return;
    }

    this.isEnviandoBrevo = true;
    this.toastMessage = 'Enviando campaña a través de Brevo...';

    const token = sessionStorage.getItem('auth_token');
    
    const formData = new FormData();
    formData.append('asunto', this.asuntoBrevo);
    formData.append('mensaje', this.mensajeBrevo);
    if (this.archivoAdjuntoBrevo) {
      formData.append('adjunto', this.archivoAdjuntoBrevo);
    }

    this.http.post(`http://127.0.0.1:8000/api/comercial/enviar-masivo`, formData, { 
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.isEnviandoBrevo = false;
        this.toastMessage = `¡Campaña enviada exitosamente a ${res.cantidad_enviados || 'todos los'} interesados!`;
        this.asuntoBrevo = '';
        this.mensajeBrevo = '';
        this.archivoAdjuntoBrevo = null;
        this.comercialTab = 'interesados';
        setTimeout(() => this.toastMessage = null, 4000);
      },
      error: (err) => {
        this.isEnviandoBrevo = false;
        console.error('Error enviando campaña:', err);
        alert('Hubo un error al enviar la campaña. Revisa la consola o asegúrate de haber autorizado la IP en Brevo.');
        this.toastMessage = null;
      }
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

  agregarConector() {
    this.nombreNuevoAddon = '';
    this.showAddonModal = true;
  }

  cerrarAddonModal() {
    this.showAddonModal = false;
    this.nombreNuevoAddon = '';
    this.editingAddonId = null;
  }

  abrirEditAddon(addon: any) {
    this.editingAddonId = addon.id;
    this.nombreNuevoAddon = addon.nombre;
    this.showAddonModal = true;
  }

  eliminarAddon(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este conector permanentemente del sistema?')) {
      this.modulosService.eliminarModuloGlobal(id).subscribe({
        next: () => {
          const addonsPaquete = this.paquetesModulos.find(p => p.id === 'addons');
          if (addonsPaquete) {
            addonsPaquete.submodulos = addonsPaquete.submodulos.filter((s: any) => s.id !== id);
          }
          this.toastMessage = `Conector eliminado exitosamente.`;
          setTimeout(() => this.toastMessage = null, 3000);
        },
        error: (err) => {
          console.error(err);
          alert('Error al eliminar el conector en el servidor.');
        }
      });
    }
  }

  guardarNuevoAddon() {
    if (!this.nombreNuevoAddon.trim()) {
      alert('Por favor, ingresa un nombre para el conector.');
      return;
    }

    const addonsPaquete = this.paquetesModulos.find(p => p.id === 'addons');
    if (!addonsPaquete) return;

    if (this.editingAddonId) {
      // Editar existente
      this.modulosService.editarModuloGlobal(this.editingAddonId, this.nombreNuevoAddon.trim()).subscribe({
        next: () => {
          const sub = addonsPaquete.submodulos.find((s: any) => s.id === this.editingAddonId);
          if (sub) {
            sub.nombre = this.nombreNuevoAddon.trim();
          }
          this.toastMessage = `¡Conector "${this.nombreNuevoAddon}" actualizado exitosamente!`;
          setTimeout(() => this.toastMessage = null, 3000);
          this.cerrarAddonModal();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar el conector en el servidor.');
        }
      });
    } else {
      // Generamos un ID seguro para el frontend/backend
      const newId = 'a_' + this.nombreNuevoAddon.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      this.modulosService.crearModuloGlobal(newId, this.nombreNuevoAddon.trim(), 'addons').subscribe({
        next: () => {
          addonsPaquete.submodulos.push({
            id: newId,
            nombre: this.nombreNuevoAddon.trim(),
            activo: false
          });
          
          this.toastMessage = `¡Conector "${this.nombreNuevoAddon}" agregado exitosamente al catálogo global!`;
          setTimeout(() => this.toastMessage = null, 3000);
          this.cerrarAddonModal();
        },
        error: (err) => {
          console.error(err);
          alert('Error al guardar el conector en el servidor. Puede que el ID ya exista.');
        }
      });
    }
  }

  toggleSubmodulo(paqueteId: string, submoduloId: string) {
    if (!this.empresaSeleccionadaId) {
      alert('Por favor selecciona una empresa primero.');
      return;
    }
    const paquete = this.paquetesModulos.find((p) => p.id === paqueteId);
    if (paquete) {
      const sub = paquete.submodulos.find((s: any) => s.id === submoduloId);
      if (sub) {
        sub.activo = !sub.activo;
        paquete.activo = paquete.submodulos.some((s: any) => s.activo); // Sincronizar
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
      paquete.submodulos.forEach((sub: any) => {
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
      const modulosState = paquete.submodulos.map((sub: any) => ({
        id: sub.id,
        activo: sub.activo
      }));
      this.toastMessage = 'Guardando cambios...';
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

    const empresa = this.empresas.find(e => e.id == this.empresaSeleccionadaId);
    if (empresa) {
      this.serverStatus.status = empresa.estado_servidor || 'online';
      this.serverStatus.lastActivity = empresa.ultimo_ping ? new Date(empresa.ultimo_ping).toLocaleString() : 'Hace unos instantes';
    }

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
        
        // En lugar de sobrescribir, actualizamos el estado 'activo' de los que coincidan
        // o añadimos los nuevos si no existían (vital para los Addons dinámicos)
        subsDB.forEach((sDB: any) => {
          const subUI = paqueteUI.submodulos.find((sUI: any) => sUI.id === sDB.id);
          
          if (subUI) {
                subUI.activo = sDB.activo;
                // Actualizar el nombre si es un Addon global editado
                if (paqueteClave === 'addons') {
                  subUI.nombre = sDB.nombre;
                }
              } else {
                // Si el submódulo viene de la BD pero no está en la UI, lo agregamos!
                paqueteUI.submodulos.push({
                  id: sDB.id,
                  nombre: sDB.nombre,
                  activo: sDB.activo
                });
              }
            });

          // Sincronizar el master toggle basado en si los submódulos están activos
          paqueteUI.activo = paqueteUI.submodulos.some((s: any) => s.activo);
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


