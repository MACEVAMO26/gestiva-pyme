import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { AccessibilityService, DaltonismMode } from '../../services/accessibility/accessibility.service';
import { ModulosService } from '../../services/modulos.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmpleadosComponent } from '../dashboard/empleados/empleados.component';
import { AdministracionComponent } from '../dashboard/administracion/administracion.component';
import { PagosComponent } from '../dashboard/pagos/pagos.component';
import { AutogestionComponent } from '../dashboard/autogestion/autogestion';

@Component({
  selector: 'app-dashboard-demo',
  standalone: true,
  imports: [CommonModule, EmpleadosComponent, AdministracionComponent, PagosComponent, AutogestionComponent],
  templateUrl: './dashboard-demo.html',
  styleUrl: './dashboard-demo.scss'
})
export class DashboardDemoComponent implements OnInit {

  // --- VARIABLES DE ESTADO ---
  user: any = null;
  isAccessibilityMenuOpen = false;
  hasVentas = false;
  hasServicios = false;
  modulosActivos: Record<string, boolean> = {};
  isSidebarCollapsed = false;
  currentModule = 'inicio';
  isCompanyInactive = false;
  tipoEmpresa = '';
  tipoEmpresaClass = '';

  public accessibilityService = inject(AccessibilityService);
  private http = inject(HttpClient);
  private modulosService = inject(ModulosService);

  constructor(private authService: AuthService) { }

  private router = inject(Router);

  ngOnInit(): void {
    this.user = this.authService.getUser() || { nombres: 'Demo User', avatar_url: '' };
    
    // Forzar el tipo de empresa basado en la ruta actual (para los demos)
    const url = this.router.url;
    if (url.includes('demo-servicios')) {
      this.tipoEmpresa = 'SERVICIOS';
      this.tipoEmpresaClass = 'servicios';
      this.hasVentas = false;
      this.hasServicios = true;
    } else if (url.includes('demo-mixto')) {
      this.tipoEmpresa = 'VENTAS Y SERVICIOS';
      this.tipoEmpresaClass = 'mixto';
      this.hasVentas = true;
      this.hasServicios = true;
    } else {
      // Por defecto demo-ventas
      this.tipoEmpresa = 'VENTAS';
      this.tipoEmpresaClass = 'ventas';
      this.hasVentas = true;
      this.hasServicios = false;
    }

    // Mockear algunos módulos activos para que el demo no se vea vacío
    this.modulosActivos = {
      's_crm': true, 'v_cxc': true, 's_age': true, 's_cat': true,
      'v_inv': true, 'v_pos': true, 'v_rep': true, 'r_tur': true
    };
  }

  cargarModulos(empresaId: number) {
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
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
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

    this.http.post('http://127.0.0.1:8000/api/user/avatar', { avatar_url: newAvatarUrl }, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.user.avatar_url = res.avatar_url;
      },
      error: (err) => console.error('Error al cambiar avatar', err)
    });
  }

  logout(): void {
    this.authService.logout();
  }
}



