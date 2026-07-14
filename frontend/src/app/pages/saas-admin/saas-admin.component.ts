import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardSaasComponent } from '../dashboard-saas/dashboard-saas.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  AccessibilityService,
  DaltonismMode,
} from '../../services/accessibility/accessibility.service';
import { EmpresaService } from '../../services/empresa.service';
import { TarifaService } from '../../services/tarifa.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModulosService } from '../../services/modulos.service';

export interface SuscripcionEmpresa {
  id: number;
  empresaId: number;
  nombreEmpresa: string;
  fechaInscripcion: string;
  plan: 'Mensual' | 'Anual';
  modulosExtra: number; // Cantidad de transversales (20k c/u)
  addonsList: { nombre: string, valor: number }[]; // Conectores externos
  descuentosAplicados: { descripcion: 'N/A' | 'Referido 10%' | 'Mes Gratis', porcentaje: number }[];
  cargosExtra: { descripcion: string, valor: number }[]; // Cargos por soporte técnico u otros
  fechaProximoPago: Date;
  estado: 'Activa' | 'Inactiva' | 'En Mora';
  renovaciones: number;
}

@Component({
  selector: 'app-saas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardSaasComponent],
  templateUrl: './saas-admin.component.html',
  styleUrls: ['./saas-admin.component.scss'],
})
export class SaasAdminComponent implements OnInit {
  // --- VARIABLES DE ESTADO ---
  user: any = null;
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
  
  isEditMode = false;
  editingId: number | null = null;
  isSubmitting: boolean = false;
  nuevaEmpresa: any = {
    razon_social: '',
    nit: '',
    tipo_empresa: 'Servicios',
  };
  listaDescuentosEmpresa: string[] = [];
  currentView = 'dashboard';

  // --- VARIABLES DE PERFIL (SEGURIDAD) ---
  userInitials = 'U';
  userName = '';
  userEmail = '';
  userAvatar: string | null = null;
  profileForm = {
    nombres: '',
    email: ''
  };
  isUpdatingProfile = false;


  // --- MOCK DATOS SUSCRIPCIONES ---
  mockSuscripciones: SuscripcionEmpresa[] = [
    {
      id: 1,
      empresaId: 101, // Mock
      nombreEmpresa: 'Empresa Ventas Demo',
      fechaInscripcion: '12/Ene/2026',
      plan: 'Mensual',
      modulosExtra: 1,
      addonsList: [{ nombre: 'Conector Factura Electrónica', valor: 10000 }],
      descuentosAplicados: [],
      cargosExtra: [],
      fechaProximoPago: new Date('2026-08-12'),
      estado: 'Activa',
      renovaciones: 6
    },
    {
      id: 2,
      empresaId: 102,
      nombreEmpresa: 'Empresa Servicios Demo',
      fechaInscripcion: '05/Mar/2026',
      plan: 'Anual',
      modulosExtra: 0,
      addonsList: [],
      descuentosAplicados: [{ descripcion: 'Referido 10%', porcentaje: 10 }],
      cargosExtra: [],
      fechaProximoPago: new Date('2027-03-05'),
      estado: 'Activa',
      renovaciones: 0
    },
    {
      id: 3,
      empresaId: 103,
      nombreEmpresa: 'Empresa Mixta Demo',
      fechaInscripcion: '20/Abr/2026',
      plan: 'Mensual',
      modulosExtra: 0,
      addonsList: [],
      descuentosAplicados: [],
      cargosExtra: [{ descripcion: 'Soporte técnico 3 hrs', valor: 15000 }],
      fechaProximoPago: new Date('2026-07-20'),
      estado: 'En Mora',
      renovaciones: 2
    }
  ];

  // --- VARIABLES PARA GESTIÓN DE SUSCRIPCIÓN ---
  showGestionSuscripcionModal = false;
  suscripcionEnEdicion: SuscripcionEmpresa | null = null;

  filtroEmpresaSolicitud: string = '';
  filtroFechaSolicitud: string = '';

  get solicitudesFiltradas() {
    return this.solicitudes.filter(s => {
      const empresaStr = s.empresa?.razon_social || '';
      const matchEmpresa = empresaStr.toLowerCase().includes(this.filtroEmpresaSolicitud.toLowerCase());
      const matchFecha = this.filtroFechaSolicitud ? (s.created_at || '').includes(this.filtroFechaSolicitud) : true;
      return matchEmpresa && matchFecha;
    });
  }

  getHeaders() {
    return { 
      'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
      'Accept': 'application/json'
    };
  }



  calcularTotalSuscripcion(suscripcion: SuscripcionEmpresa): number {
    let subtotal = 0;
    
    if (suscripcion.plan === 'Mensual') {
      subtotal += 70000;
      subtotal += (suscripcion.modulosExtra * 20000);
    } else if (suscripcion.plan === 'Anual') {
      subtotal += 770000; // 11 meses base
      subtotal += (suscripcion.modulosExtra * 220000); // 11 meses de transversales
    }
    
    // Sumar todos los porcentajes de descuento
    let porcentajeTotalDesc = 0;
    suscripcion.descuentosAplicados.forEach(desc => {
      porcentajeTotalDesc += desc.porcentaje;
    });

    // El descuento aplica sobre el subtotal (plan base + transversales)
    let total = subtotal;
    if (porcentajeTotalDesc > 0) {
      total = total - (total * (porcentajeTotalDesc / 100));
    }
    
    // Los addons y el soporte no tienen descuento
    suscripcion.addonsList.forEach(addon => {
      total += addon.valor;
    });

    suscripcion.cargosExtra.forEach(cargo => {
      // El soporte es gratuito si la empresa tiene plan Anual
      if (suscripcion.plan !== 'Anual') {
        total += cargo.valor;
      }
    });
    
    return total;
  }

  renovarMockSuscripcion(suscripcionId: number) {
    const sub = this.mockSuscripciones.find(s => s.id === suscripcionId);
    if (!sub) return;
    
    // Lógica para adelantar la fecha
    const nuevaFecha = new Date(sub.fechaProximoPago);
    if (sub.plan === 'Mensual') {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    } else {
      nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
    }
    
    sub.fechaProximoPago = nuevaFecha;
    sub.cargosExtra = []; // Se resetean los cargos tras pagar
    sub.descuentosAplicados = []; // Se resetean los descuentos a un solo uso
    sub.estado = 'Activa';
    sub.renovaciones += 1;
    
    this.toastService.success(`Suscripción de ${sub.nombreEmpresa} renovada exitosamente hasta el ${nuevaFecha.toLocaleDateString()}.`);
  }

  // --- MÉTODOS DEL MODAL DE GESTIÓN ---
  abrirModalGestionSuscripcion(suscripcion: SuscripcionEmpresa) {
    // Clonamos profundamente para no mutar los originales hasta guardar
    this.suscripcionEnEdicion = JSON.parse(JSON.stringify(suscripcion));
    this.showGestionSuscripcionModal = true;
  }

  cerrarModalGestionSuscripcion() {
    this.suscripcionEnEdicion = null;
    this.showGestionSuscripcionModal = false;
  }

  agregarCargoExtra() {
    if (this.suscripcionEnEdicion) {
      this.suscripcionEnEdicion.cargosExtra.push({ descripcion: '', valor: 0 });
    }
  }

  eliminarCargoExtra(index: number) {
    if (this.suscripcionEnEdicion) {
      this.suscripcionEnEdicion.cargosExtra.splice(index, 1);
    }
  }

  agregarDescuento() {
    if (this.suscripcionEnEdicion) {
      this.suscripcionEnEdicion.descuentosAplicados.push({ descripcion: 'N/A', porcentaje: 0 });
    }
  }

  eliminarDescuento(index: number) {
    if (this.suscripcionEnEdicion) {
      this.suscripcionEnEdicion.descuentosAplicados.splice(index, 1);
    }
  }
  
  agregarSuscripcionAddon() {
    if (this.suscripcionEnEdicion) {
      this.suscripcionEnEdicion.addonsList.push({ nombre: '', valor: 0 });
    }
  }

  eliminarSuscripcionAddon(index: number) {
    if (this.suscripcionEnEdicion) {
      this.suscripcionEnEdicion.addonsList.splice(index, 1);
    }
  }

  guardarGestionSuscripcion() {
    if (!this.suscripcionEnEdicion) return;
    
    // Call backend API
    const payload = {
      descuentosAplicados: this.suscripcionEnEdicion.descuentosAplicados,
      cargosExtra: this.suscripcionEnEdicion.cargosExtra,
      addonsList: this.suscripcionEnEdicion.addonsList
    };

    this.empresaService.updateTarifas(this.suscripcionEnEdicion.empresaId || this.suscripcionEnEdicion.id, payload).subscribe({
      next: () => {
        this.toastService.success('Tarifas de la empresa actualizadas exitosamente.');
        this.cargarSuscripciones(); // Recargar la tabla desde el backend
        this.cerrarModalGestionSuscripcion();
      },
      error: (err) => {
        this.toastService.error('Error al guardar las tarifas de la empresa.');
        console.error(err);
      }
    });
  }

  suspenderMockSuscripcion(suscripcionId: number) {
    const sub = this.mockSuscripciones.find(s => s.id === suscripcionId);
    if (sub) {
      sub.estado = 'Inactiva';
      this.toastService.success(`Suscripción de ${sub.nombreEmpresa} ha sido suspendida.`);
    }
  }
  solicitudes: any[] = [];
  solicitudesPendientes: number = 0;
  paquetesModulos: any[] = [];
  statsSuscripciones = {
    mrr: 0,
    clientesActivos: 0,
    clientesMora: 0,
    crecimientoMensual: 0,
  };
  suscripcionesList: any[] = [];
  serverStatus: any = {
    status: 'online',
    generalUptime: '99.9%',
    dbConnection: 'Estable',
    lastBackup: 'Hace 2 horas',
    lastActivity: 'Desconocida',
  };
  empresaSeleccionadaId: string | null = null;
  comercialTab: 'interesados' | 'correos' = 'interesados';
  leads: any[] = [];
  showNotasModal = false;
  leadSeleccionadoParaNotas: any = null;
  nuevaNotaTexto = '';
  asuntoBrevo: string = '';
  mensajeBrevo: string = '';
  isEnviandoBrevo: boolean = false;
  archivoAdjuntoBrevo: File | null = null;
  debugError: string | null = null;
  isSidebarCollapsed = false;
  isModalSolicitudOpen = false;
  solicitudSeleccionada: any = null;
  mensajeRespuesta: string = '';

  public accessibilityService = inject(AccessibilityService);
  public toastService = inject(ToastService);
  private empresaService = inject(EmpresaService);
  private tarifaService = inject(TarifaService);
  tarifaConfig: any = null;
  private cdr = inject(ChangeDetectorRef);

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
    
    // Inicializar datos del perfil
    if (this.user) {
      this.userName = this.user.nombres || 'Usuario';
      this.userEmail = this.user.email || '';
      this.userInitials = this.userName.substring(0, 2).toUpperCase();
      this.userAvatar = this.user.avatar_url || null;
      this.profileForm.nombres = this.userName;
      this.profileForm.email = this.userEmail;
    }

    // Redirige al panel correspondiente según el tipo de usuario
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
    this.cargarTarifas();
    this.cargarSystemStats();
  }

  // Muestra el modal para gestionar las notas del cliente interesado
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
      .patch(`https://gestiva-pyme.onrender.com/api/leads/${this.leadSeleccionadoParaNotas.id}`, { notas: this.leadSeleccionadoParaNotas.notas }, { headers })
      .subscribe({
        next: () => {},
        error: () => this.toastService.error('Error al guardar la nota.')
      });
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
    this.http.get<any[]>(`https://gestiva-pyme.onrender.com/api/leads?t=${t}`, { headers }).subscribe({
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

  // --- MÉTODOS DE PERFIL Y SEGURIDAD ---
  actualizarPerfil() {
    this.isUpdatingProfile = true;
    this.http.put('https://gestiva-pyme.onrender.com/api/profile', this.profileForm, { headers: this.getHeaders() }).subscribe({
        next: (res: any) => {
          this.userName = res.user.nombres;
          this.userEmail = res.user.email;
          this.userInitials = this.userName.substring(0, 2).toUpperCase();
          
          // Actualizar sessionStorage
          const currentUser = this.authService.getUser();
          if (currentUser) {
            currentUser.nombres = this.userName;
            currentUser.email = this.userEmail;
            sessionStorage.setItem('current_user', JSON.stringify(currentUser));
          }

          this.toastService.success('Perfil actualizado correctamente');
          this.isUpdatingProfile = false;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error al actualizar el perfil.');
          this.isUpdatingProfile = false;
        }
      });
  }

  forzarCambioClave() {
    this.confirmModalTitle = 'Forzar Cambio de Clave';
    this.confirmModalMessage = 'Al aceptar, tu sesión se cerrará de inmediato y el sistema te obligará a registrar una nueva contraseña. ¿Estás segura?';
    this.confirmActionCallback = () => {
      this.http.post('https://gestiva-pyme.onrender.com/api/profile/force-password-reset', {}, { headers: this.getHeaders() }).subscribe({
        next: (res: any) => {
          this.toastService.warning(res.message || 'Se requerirá cambio de contraseña en el próximo ingreso.');
          setTimeout(() => {
            this.logout();
          }, 2000);
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error al intentar forzar el cambio de clave.');
        }
      });
    };
    this.confirmModalVisible = true;
  }

  // Sube y actualiza el avatar del usuario
  subirAvatar(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Comprimir la imagen antes de subirla
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calcular nuevas dimensiones manteniendo el ratio (máximo 500px)
          const MAX_SIZE = 500;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Convertir de vuelta a archivo (calidad 0.8)
            canvas.toBlob((blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                const formData = new FormData();
                formData.append('avatar', compressedFile);

                this.http.post('https://gestiva-pyme.onrender.com/api/profile/avatar', formData, { 
                  headers: this.getHeaders()
                }).subscribe({
                  next: (res: any) => {
                    this.userAvatar = res.avatar_url;
                    
                    // Actualizar sessionStorage
                    const currentUser = this.authService.getUser();
                    if (currentUser) {
                      currentUser.avatar_url = this.userAvatar;
                      sessionStorage.setItem('current_user', JSON.stringify(currentUser));
                    }

                    this.toastService.success('Avatar actualizado correctamente');
                  },
                  error: (err) => {
                    console.error(err);
                    let errorMsg = 'Error al subir el avatar. Inténtalo de nuevo.';
                    if (err.error && err.error.message) {
                      errorMsg = err.error.message;
                    }
                    this.toastService.error(errorMsg);
                  }
                });
              }
            }, 'image/jpeg', 0.8);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  // --- MÉTODOS DE MODALES (Suscripciones / Tarifas) ---

  enviarCampanaBrevo() {
    if (!this.asuntoBrevo.trim() || !this.mensajeBrevo.trim()) {
      this.toastService.warning('El asunto y el mensaje son obligatorios.');
      return;
    }

    this.isEnviandoBrevo = true;
    this.toastService.info('Enviando campaña a través de Brevo...');

    const token = sessionStorage.getItem('auth_token');
    
    const formData = new FormData();
    formData.append('asunto', this.asuntoBrevo);
    formData.append('mensaje', this.mensajeBrevo);
    if (this.archivoAdjuntoBrevo) {
      formData.append('adjunto', this.archivoAdjuntoBrevo);
    }

    this.http.post(`https://gestiva-pyme.onrender.com/api/comercial/enviar-masivo`, formData, { 
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.isEnviandoBrevo = false;
        this.toastService.success(`¡Campaña enviada exitosamente a ${res.cantidad_enviados || 'todos los'} interesados!`);
        this.asuntoBrevo = '';
        this.mensajeBrevo = '';
        this.archivoAdjuntoBrevo = null;
        this.cdr.detectChanges();
        
      },
      error: (err) => {
        this.isEnviandoBrevo = false;
        console.error('Error enviando campaña:', err);
        this.toastService.error('Hubo un error al enviar. Revisa la consola o asegúrate de que Brevo permita el remitente.');
        this.cdr.detectChanges();
        
      }
    });
  }

  cambiarEstadoLead(id: number, nuevoEstado: string) {
    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    this.http
      .patch(`https://gestiva-pyme.onrender.com/api/leads/${id}`, { estado: nuevoEstado }, { headers })
      .subscribe({
        next: () => {
          this.cargarLeads();
        },
        error: () => this.toastService.error('Error al actualizar estado del interesado.'),
      });
  }

  eliminarLead(id: number) {
    this.abrirConfirmacion('Confirmar Acción', '¿Estás seguro de que deseas eliminar este lead? Esta acción no se puede deshacer.', () => {
      const token = sessionStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };
      this.http.delete(`https://gestiva-pyme.onrender.com/api/leads/${id}`, { headers }).subscribe({
        next: () => {
          this.cargarLeads();
        },
        error: () => this.toastService.error('Error al eliminar el lead.'),
      });
    });
  }

  cargarSolicitudes() {
    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>('https://gestiva-pyme.onrender.com/api/admin-requests', { headers }).subscribe({
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
      this.toastService.warning('Debes ingresar un motivo en caso de rechazo.');
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
        `https://gestiva-pyme.onrender.com/api/admin-requests/${this.solicitudSeleccionada.id}/process`,
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
        error: () => this.toastService.error('Error al procesar solicitud.'),
      });
  }

  marcarComoResueltaRapido(solicitud: any) {
    const token = sessionStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };
    const body = {
      accion: 'aprobado',
      mensaje: 'Resuelta.',
    };

    this.http
      .patch(
        `https://gestiva-pyme.onrender.com/api/admin-requests/${solicitud.id}/process`,
        body,
        { headers },
      )
      .subscribe({
        next: () => {
          this.cargarSolicitudes();
        },
        error: () => this.toastService.error('Error al procesar solicitud.'),
      });
  }

  cargarEmpresas() {
    this.empresaService.getEmpresas().subscribe({
      next: (data) => {
        this.empresas = data.map((emp: any) => {
          if (emp.tipo_empresa?.includes('Ventas y Servicios')) emp.tipo_empresa = 'Mixto';
          else if (emp.tipo_empresa?.includes('Ventas')) emp.tipo_empresa = 'Ventas';
          else if (emp.tipo_empresa?.includes('Servicios')) emp.tipo_empresa = 'Servicios';
          return emp;
        });
        this.empresasEnMora = data.filter((e: any) => e.activo && e.estado_pago === 'mora').length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar:', err),
    });
  }

  renovarSuscripcion(id: number) {
    if (confirm('¿Estás seguro de registrar una nueva renovación? Se sumará 1 al contador y se adelantará el próximo pago 30 días.')) {
      this.empresaService.renovarSuscripcion(id).subscribe({
        next: (res) => {
          this.cargarSuscripciones(); // Recargar la tabla
        },
        error: (err) => console.error('Error al renovar suscripción', err)
      });
    }
  }

  cargarTarifas() {
    this.tarifaService.getTarifas().subscribe({
      next: (data) => {
        this.tarifaConfig = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar tarifas', err)
    });
  }



  // --- VARIABLES Y MÉTODOS PARA MODAL DE CONFIRMACIÓN ---
  confirmModalVisible = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmActionCallback: (() => void) | null = null;

  abrirConfirmacion(titulo: string, mensaje: string, accion: () => void) {
    this.confirmModalTitle = titulo;
    this.confirmModalMessage = mensaje;
    this.confirmActionCallback = accion;
    this.confirmModalVisible = true;
  }

  ejecutarConfirmacion() {
    if (this.confirmActionCallback) {
      this.confirmActionCallback();
    }
    this.cerrarConfirmacion();
  }

  cerrarConfirmacion() {
    this.confirmModalVisible = false;
    this.confirmActionCallback = null;
  }

  modalTarifasGlobalesVisible = false;

  abrirModalTarifasGlobales() {
    this.modalTarifasGlobalesVisible = true;
  }

  cerrarModalTarifasGlobales() {
    this.modalTarifasGlobalesVisible = false;
  }

  guardarTarifas() {
    if (!this.tarifaConfig) return;
    this.tarifaService.updateTarifas(this.tarifaConfig.id, this.tarifaConfig).subscribe({
      next: () => {
        this.toastService.success('Tarifas actualizadas correctamente.');
        this.cargarSuscripciones(); // Recalcular
          this.cerrarModalTarifasGlobales();
      },
      error: (err) => console.error('Error guardando tarifas', err)
    });
  }

  noRenovarSuscripcion(id: number) {
    if (confirm('¿Estás seguro de NO renovar esta suscripción? El cliente pasará a Inactivo.')) {
      this.empresaService.noRenovarSuscripcion(id).subscribe({
        next: () => this.cargarSuscripciones(),
        error: (err) => console.error('Error al cancelar', err)
      });
    }
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
    this.listaDescuentosEmpresa = [];
    this.nuevaEmpresa = { razon_social: '', nit: '', tipo_empresa: 'Servicios', fecha_inscripcion: '', periodo: 'Mensual', descuento: 'N/A' };
    this.showModal = true;
  }

  editarEmpresa(empresa: any) {
    this.isEditMode = true;
    this.editingId = empresa.id;
    this.listaDescuentosEmpresa = (empresa.descuento && empresa.descuento !== 'N/A') ? empresa.descuento.split(',').map((d: string) => d.trim()) : [];
    this.nuevaEmpresa = {
      razon_social: empresa.razon_social,
      nit: empresa.nit,
      tipo_empresa: empresa.tipo_empresa,
      descuento: empresa.descuento || 'N/A',
      periodo: empresa.periodo || 'Mensual',
      fecha_inscripcion: empresa.fecha_inscripcion
    };
    this.showModal = true;
  }

  agregarDescuentoEmpresaForm() {
    this.listaDescuentosEmpresa.push('N/A');
  }

  eliminarDescuentoEmpresaForm(index: number) {
    this.listaDescuentosEmpresa.splice(index, 1);
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
          this.toastService.success(`Conector eliminado exitosamente.`);
          
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error al eliminar el conector en el servidor.');
        }
      });
    }
  }

  guardarNuevoAddon() {
    if (!this.nombreNuevoAddon.trim()) {
      this.toastService.warning('Por favor, ingresa un nombre para el conector.');
      return;
    }

    const addonsPaquete = this.paquetesModulos.find(p => p.id === 'addons');
    if (!addonsPaquete) return;

    if (this.editingAddonId) {
      this.modulosService.editarModuloGlobal(this.editingAddonId, this.nombreNuevoAddon.trim()).subscribe({
        next: () => {
          const sub = addonsPaquete.submodulos.find((s: any) => s.id === this.editingAddonId);
          if (sub) {
            sub.nombre = this.nombreNuevoAddon.trim();
          }
          this.toastService.success(`¡Conector "${this.nombreNuevoAddon}" actualizado exitosamente!`);
          
          this.cerrarAddonModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error al actualizar el conector en el servidor.');
        }
      });
    } else {
      const newId = 'a_' + this.nombreNuevoAddon.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      this.modulosService.crearModuloGlobal(newId, this.nombreNuevoAddon.trim(), 'addons').subscribe({
        next: () => {
          addonsPaquete.submodulos.push({
            id: newId,
            nombre: this.nombreNuevoAddon.trim(),
            activo: false
          });
          
          this.toastService.success(`¡Conector "${this.nombreNuevoAddon}" agregado exitosamente al catálogo global!`);
          
          this.cerrarAddonModal();
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error al guardar el conector en el servidor. Puede que el ID ya exista.');
        }
      });
    }
  }

  toggleSubmodulo(paqueteId: string, submoduloId: string) {
    if (!this.empresaSeleccionadaId) {
      this.toastService.warning('Por favor selecciona una empresa primero.');
      return;
    }
    const paquete = this.paquetesModulos.find((p) => p.id === paqueteId);
    if (paquete) {
      const sub = paquete.submodulos.find((s: any) => s.id === submoduloId);
      if (sub) {
        sub.activo = !sub.activo;
        paquete.activo = paquete.submodulos.some((s: any) => s.activo);
      }
    }
  }

  togglePaqueteCompleto(paqueteId: string, activar: boolean) {
    if (!this.empresaSeleccionadaId) {
      this.toastService.warning('Por favor selecciona una empresa primero.');
      return;
    }
    const paquete = this.paquetesModulos.find((p) => p.id === paqueteId);
    if (paquete) {
      paquete.activo = activar;
      paquete.submodulos.forEach((sub: any) => {
        if (sub.activo !== activar) {
          sub.activo = activar;
        }
      });
    }
  }

  anexarAddon() {
    this.toastService.info('Funcionalidad en desarrollo: Aquí se desplegará el catálogo de conectores externos (Ej. APIs, Software Contable, etc.) de los cuales GestivaPyme ofrece integración.');
  }

  guardarPaquete(paqueteId: string) {
    if (!this.empresaSeleccionadaId) {
      this.toastService.warning('Por favor selecciona una empresa primero.');
      return;
    }
    const paquete = this.paquetesModulos.find((p) => p.id === paqueteId);
    if (paquete) {
      const modulosState = paquete.submodulos.map((sub: any) => ({
        id: sub.id,
        activo: sub.activo
      }));
      this.toastService.info('Guardando cambios...');
      this.modulosService.updatePaqueteEmpresa(this.empresaSeleccionadaId, modulosState).subscribe({
        next: (res) => {
          console.log(`Paquete ${paquete.nombre} actualizado masivamente`, res);
          this.toastService.success(`¡Los cambios al paquete ${paquete.nombre} se han guardado correctamente!`);
          this.cdr.detectChanges();
          
        },
        error: (err) => {
          console.error('Error al actualizar paquete masivamente', err);
          this.toastService.error('Error al guardar el paquete en el servidor.');
          this.cdr.detectChanges();
          
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
    Object.keys(modulosBD).forEach((paqueteClave) => {
      const paqueteUI = this.paquetesModulos.find(
        (p) => p.nombre.toLowerCase().includes(paqueteClave) || p.id === paqueteClave,
      );
      if (paqueteUI) {
        const subsDB = modulosBD[paqueteClave];
        
        subsDB.forEach((sDB: any) => {
          const subUI = paqueteUI.submodulos.find((sUI: any) => sUI.id === sDB.id);
          
          if (subUI) {
            subUI.activo = sDB.activo;
            if (paqueteClave === 'addons') {
              subUI.nombre = sDB.nombre;
            }
          } else {
            paqueteUI.submodulos.push({
              id: sDB.id,
              nombre: sDB.nombre,
              activo: sDB.activo
            });
          }
        });

        paqueteUI.activo = paqueteUI.submodulos.some((s: any) => s.activo);
      }
    });
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.editingId = null;
    this.listaDescuentosEmpresa = [];
    this.nuevaEmpresa = { razon_social: '', nit: '', tipo_empresa: 'Servicios', fecha_inscripcion: '', periodo: 'Mensual', descuento: 'N/A' };
  }

  cerrarSuccessModal() {
    this.showSuccessModal = false;
  }

  guardarEmpresa() {
    // Preparar el campo descuento uniendo el array
    this.nuevaEmpresa.descuento = this.listaDescuentosEmpresa.filter(d => d !== 'N/A').length > 0 
      ? this.listaDescuentosEmpresa.filter(d => d !== 'N/A').join(', ') 
      : 'N/A';

    if (this.isEditMode && this.editingId) {
      this.empresaService.updateEmpresa(this.editingId, this.nuevaEmpresa).subscribe({
        next: () => {
          this.sincronizarMockSuscripciones();
          this.cargarEmpresas();
          this.cerrarModal();
        },
        error: (err) => this.toastService.error('Error al actualizar la empresa.'),
      });
    } else {
      this.empresaService.createEmpresa(this.nuevaEmpresa).subscribe({
        next: (response) => {
          this.createdAdminEmail = response.admin_email;
          this.showSuccessModal = true;
          this.sincronizarMockSuscripciones();
          this.cargarEmpresas();
          this.cerrarModal();
        },
        error: (err) => this.toastService.error('Error al crear la empresa. Revisa los datos (ej. NIT duplicado).'),
      });
    }
  }

  private sincronizarMockSuscripciones() {
    // Reflejar la realidad de los descuentos de la empresa en la tabla de suscripciones
    const sub = this.mockSuscripciones.find(s => s.nombreEmpresa === this.nuevaEmpresa.razon_social);
    if (sub) {
      sub.descuentosAplicados = this.listaDescuentosEmpresa
        .filter(d => d !== 'N/A')
        .map(d => ({
          descripcion: d,
          porcentaje: d === 'Mes Gratis' ? 8.33 : (d === 'Referido 10%' ? 10 : 0)
        } as any));
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
        error: () => this.toastService.error('Error al cambiar el estado de la empresa.'),
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

  formatTipo(tipo: string): string {
    if (!tipo) return '';
    return tipo.replace(/_/g, ' ');
  }
}
