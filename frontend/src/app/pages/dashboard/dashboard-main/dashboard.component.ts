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

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      // Auto-colapsa la barra en pantallas divididas o tablets pequeñas,
      // pero no en móviles verdaderos (donde se oculta con CSS)
      this.isSidebarCollapsed = window.innerWidth <= 1024;
    }
  }

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

  cargarNotificaciones() {
    this.http.get<any[]>('/api/notificaciones').subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.notificacionesNoLeidas = this.notificaciones.length;
      },
      error: (err) => console.error('Error al cargar notificaciones', err)
    });
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isAccessibilityMenuOpen = false; // cerrar el otro menú
    }
  }

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

  checkGestivaTutorial() {
    if (this.user && typeof window !== 'undefined') {
      const userKey = this.user.email || this.user.id || 'default';
      const tutorialVisto = localStorage.getItem('gestiva_tutorial_visto_' + userKey);
      if (!tutorialVisto) {
        this.showGestivaOnboarding = true;
      }
    }
  }

  cerrarGestivaOnboarding() {
    this.showGestivaOnboarding = false;
    if (this.user && typeof window !== 'undefined') {
      const userKey = this.user.email || this.user.id || 'default';
      localStorage.setItem('gestiva_tutorial_visto_' + userKey, 'true');
    }
  }

  getLogoUrl(): string {
    if (this.user?.empresa?.logo_url) {
      const url = this.user.empresa.logo_url;
      return url.startsWith('http') ? url : `http://localhost:8000${url}`;
    }
    return 'assets/images/Logos/GESTIVAPYME(7).png';
  }

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

  toggleAccessibilityMenu() {
    this.isAccessibilityMenuOpen = !this.isAccessibilityMenuOpen;
    if (this.isAccessibilityMenuOpen) {
      this.isNotificationsOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  setDaltonismMode(mode: DaltonismMode) {
    this.accessibilityService.setMode(mode);
    this.isAccessibilityMenuOpen = false;
  }

  switchModule(moduleName: string) {
    this.currentModule = moduleName;
  }

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

  logout(): void {
    this.authService.logout();
  }

  // --- LÓGICA CONTRATO SAAS ---
  checkContractStatus() {
    if (this.user && this.user.empresa && this.user.rol?.nombre?.includes('Gerente')) {
      // Usar setTimeout para asegurar que el DOM este listo para Angular
      setTimeout(() => {
          if (!this.user.empresa.contrato_aceptado) {
            this.showContractModal = true;
            // Iniciar canvas después de un pequeño delay para que el modal renderice
            setTimeout(() => this.initSignaturePad(), 300);
          }
      });
    }
  }

  initSignaturePad() {
    const canvas = document.getElementById('signatureCanvas') as HTMLCanvasElement;
    if (canvas) {
      // Ajustar tamaño del canvas
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);

      import('signature_pad').then(SignaturePad => {
        this.signaturePad = new SignaturePad.default(canvas, {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          penColor: 'rgb(0, 0, 0)'
        });
      }).catch(err => console.error("Falta instalar signature_pad", err));
    }
  }

  clearSignature() {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

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



