import { Component, OnInit, inject, HostListener } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { AccessibilityService, DaltonismMode } from '../../../services/accessibility/accessibility.service';
import { ModulosService } from '../../../services/modulos.service';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { Onboarding } from '../gestiva-ai-assistant/onboarding/onboarding';
import { GestivaBotComponent } from '../../../shared/components/gestiva-bot/gestiva-bot';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Onboarding, GestivaBotComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  // --- VARIABLES DE ESTADO ---
  user: any = null;
  isAccessibilityMenuOpen = false;
  hasVentas = false;
  hasServicios = false;
  modulosActivos: Record<string, boolean> = {};
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  currentModule = 'inicio';
  isCompanyInactive = false;
  isFormalizado = true;
  tipoEmpresa = '';
  tipoEmpresaClass = '';
  showGestivaOnboarding = false;

  // Notificaciones
  isNotificationsOpen = false;
  notificaciones: any[] = [];
  notificacionesNoLeidas = 0;

  public accessibilityService = inject(AccessibilityService);
  private http = inject(HttpClient);
  private modulosService = inject(ModulosService);

  constructor(private authService: AuthService) {
    this.checkScreenSize();
  }

  // Para manejar el redimensionamiento
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  // Para comprobar tamaño de pantalla
  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      // Auto-colapsa la barra en pantallas divididas o tablets pequeñas,
      // pero no en móviles verdaderos (donde se oculta con CSS)
      this.isSidebarCollapsed = window.innerWidth <= 1024;
    }
  }

  // Al iniciar el componente
  ngOnInit(): void {
    this.user = this.authService.getUser();
    
    // Guardian Frontend
    const rol = this.user?.rol?.nombre;
    this.isFormalizado = (rol === 'Gerente General' || rol === 'Admin Saas' || rol === 'Administrador' || !!this.user?.perfil_formalizado);

    // Determina los módulos activos de la empresa
    if (this.user && this.user.empresa) {
      const tipo = this.user.empresa.tipo_empresa;
      this.tipoEmpresa = tipo === 'Mixto' ? 'VENTAS Y SERVICIOS' : tipo.toUpperCase().replace(/SOLO\s+/g, '');
      this.tipoEmpresaClass = tipo === 'Ventas y Servicios' ? 'mixto' : tipo.toLowerCase();
      this.hasVentas = tipo.toLowerCase().includes('ventas');
      this.hasServicios = tipo.toLowerCase().includes('servicios');
      
      // Inyectar el color corporativo de la empresa
      if (this.user.empresa.color_primario) {
        document.documentElement.style.setProperty('--theme-primary', this.user.empresa.color_primario);
      } else {
        document.documentElement.style.removeProperty('--theme-primary');
      }

      if (this.user.empresa.estado_pago === 'mora') {
        this.isCompanyInactive = true;
        this.currentModule = 'pagos';
      }

      this.cargarModulos(this.user.empresa_id);
      this.checkGestivaTutorial();
      this.cargarNotificaciones();
      this.checkContractStatus();
    }
  }

  // Para cargar las notificaciones del usuario
  cargarNotificaciones() {
    this.http.get<any[]>('/api/notificaciones').subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.notificacionesNoLeidas = this.notificaciones.length;
      },
      error: (err) => console.error('Error al cargar notificaciones', err)
    });
  }

  // Para abrir/cerrar notificaciones
  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isAccessibilityMenuOpen = false; // cerrar el otro menú
    }
  }

  // Para marcar notificación como leída
  marcarLeida(id: number, event: Event) {
    event.stopPropagation();
    this.http.delete(`/api/notificaciones/${id}/leida`).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter(n => n.id !== id);
        this.notificacionesNoLeidas = this.notificaciones.length;
      },
      error: (err) => console.error('Error al marcar leida', err)
    });
  }

  // Para ver si vio el tutorial
  checkGestivaTutorial() {
    if (this.user && typeof window !== 'undefined') {
      const userKey = this.user.email || this.user.id || 'default';
      const tutorialVisto = localStorage.getItem('gestiva_tutorial_visto_' + userKey);
      if (!tutorialVisto) {
        this.showGestivaOnboarding = true;
      }
    }
  }

  // Para cerrar el tutorial
  cerrarGestivaOnboarding() {
    this.showGestivaOnboarding = false;
    if (this.user && typeof window !== 'undefined') {
      const userKey = this.user.email || this.user.id || 'default';
      localStorage.setItem('gestiva_tutorial_visto_' + userKey, 'true');
    }
  }

  // Para obtener logo de empresa
  getLogoUrl(): string {
    if (this.user?.empresa?.logo_url) {
      const url = this.user.empresa.logo_url;
      return url.startsWith('http') ? url : `http://localhost:8000${url}`;
    }
    return 'assets/images/Logos/GESTIVAPYME(7).png';
  }

  // Para cargar módulos activos
  cargarModulos(empresaId: number) {
    const modulosGuardados = this.authService.getModulosActivos();
    if (modulosGuardados) {
      this.modulosActivos = modulosGuardados;
      return;
    }

    // Fallback si por alguna razón no se guardaron
    this.modulosService.getModulosPorEmpresa(empresaId).subscribe({
      next: (res: any) => {
        if (res && res.modulos) {
          Object.values(res.modulos).forEach((paquete: any) => {
            paquete.forEach((mod: any) => {
              this.modulosActivos[mod.id] = mod.activo;
            });
          });
        }
      },
      error: (err: any) => {
        console.error('Error al cargar módulos del Dashboard:', err);
      }
    });
  }

  // Para el menú de accesibilidad
  toggleAccessibilityMenu() {
    this.isAccessibilityMenuOpen = !this.isAccessibilityMenuOpen;
    if (this.isAccessibilityMenuOpen) {
      this.isNotificationsOpen = false;
    }
  }

  // Para colapsar sidebar
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Para menú móvil
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Para aplicar modo daltonismo
  setDaltonismMode(mode: DaltonismMode) {
    this.accessibilityService.setMode(mode);
    this.isAccessibilityMenuOpen = false;
  }

  // Para cambiar de módulo
  switchModule(moduleName: string) {
    this.currentModule = moduleName;
  }

  // Para cambiar el avatar
  changeAvatar() {
    const seed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/8.x/adventurer/svg?seed=${seed}`;
    
    const token = sessionStorage.getItem('auth_token');
    if (!token) return;

    this.http.post('/api/user/avatar', { avatar_url: newAvatarUrl }, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.user.avatar_url = res.avatar_url;
      },
      error: (err) => console.error('Error al cambiar avatar', err)
    });
  }

  // --- CONTRATO SAAS ---
  showContractModal = false;
  isSigning = false;
  signaturePad: any = null;

  // Para cerrar sesión
  logout(): void {
    this.authService.logout();
  }

  // --- LÓGICA CONTRATO SAAS ---
  // Para comprobar el contrato
  checkContractStatus() {
    if (this.user && this.user.empresa && this.user.rol?.nombre?.includes('Gerente')) {
      // Usar setTimeout para asegurar que el DOM este listo para Angular
      setTimeout(() => {
          if (!this.user.empresa.contrato_aceptado) {
            this.showContractModal = true;
            // Iniciar canvas después de un delay un poco mayor para asegurar render
            setTimeout(() => this.initSignaturePad(), 500);
          }
      });
    }
  }

  // Para inicializar firma
  initSignaturePad() {
    const canvas = document.getElementById('signatureCanvas') as HTMLCanvasElement;
    if (canvas) {
      // Validar si el DOM ya renderizó el ancho
      if (canvas.offsetWidth === 0) {
        setTimeout(() => this.initSignaturePad(), 100); // Reintentar si está en ancho 0 (fade-in)
        return;
      }

      // Evitar distorsión de coordenadas de ratón igualando tamaño interno y externo
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      import('signature_pad').then(module => {
        const SignaturePadClass = module.default || module;
        
        // Si ya existe instancia anterior, la borramos para evitar leaks o doble binding
        if (this.signaturePad) {
          this.signaturePad.off();
        }

        this.signaturePad = new SignaturePadClass(canvas, {
          backgroundColor: 'rgb(248, 250, 252)', // Igual al color de fondo de la clase canvas-wrapper en scss
          penColor: 'rgb(0, 0, 0)',
          minWidth: 1,
          maxWidth: 3
        });
        
        // Un resize listener para la ventana (opcional pero bueno para firmas perdidas en responsive)
        window.addEventListener('resize', () => {
          if (canvas.offsetWidth === 0) return; // Oculto
          const data = this.signaturePad.toData();
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d")?.scale(ratio, ratio);
          this.signaturePad.clear();
          this.signaturePad.fromData(data);
        });

      }).catch(err => console.error("Falta instalar signature_pad", err));
    }
  }

  // Para limpiar firma
  clearSignature() {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  // Para aceptar el contrato
  acceptContract() {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      alert("Por favor, ingresa tu firma electrónica para continuar.");
      return;
    }

    const firmaBase64 = this.signaturePad.toDataURL('image/png');
    this.isSigning = true;

    this.http.post(`/api/empresas/${this.user.empresa_id}/aceptar-contrato`, { firma_base64: firmaBase64 })
      .subscribe({
        next: (res) => {
          this.isSigning = false;
          this.showContractModal = false;
          this.user.empresa.contrato_aceptado = true;
          this.authService.setUser(this.user); // Actualizar usuario en sesión
        },
        error: (err) => {
          this.isSigning = false;
          alert("Error al firmar el contrato. Intenta de nuevo.");
        }
      });
  }
}



