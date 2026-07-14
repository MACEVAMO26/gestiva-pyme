import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { AccessibilityService, DaltonismMode } from '../../../services/accessibility/accessibility.service';
import { ModulosService } from '../../../services/modulos.service';
import { CommonModule } from '@angular/common';
import { EmpleadosComponent } from '../empleados/empleados.component';
import { AdministracionComponent } from '../administracion/administracion.component';
import { PagosComponent } from '../pagos/pagos.component';

import { AutogestionComponent } from '../autogestion/autogestion';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EmpleadosComponent, AdministracionComponent, PagosComponent, AutogestionComponent],
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
  currentModule = 'inicio';
  isCompanyInactive = false;
  tipoEmpresa = '';
  tipoEmpresaClass = '';

  public accessibilityService = inject(AccessibilityService);
  private http = inject(HttpClient);
  private modulosService = inject(ModulosService);

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    
    // Determina los módulos activos de la empresa
    if (this.user && this.user.empresa) {
      const tipo = this.user.empresa.tipo_empresa;
      this.tipoEmpresa = tipo === 'Mixto' ? 'VENTAS Y SERVICIOS' : tipo.toUpperCase().replace(/SOLO\s+/g, '');
      this.tipoEmpresaClass = tipo === 'Ventas y Servicios' ? 'mixto' : tipo.toLowerCase();
      this.hasVentas = tipo.toLowerCase().includes('ventas');
      this.hasServicios = tipo.toLowerCase().includes('servicios');
      
      if (this.user.empresa.estado_pago === 'mora') {
        this.isCompanyInactive = true;
        this.currentModule = 'pagos';
      }

      this.cargarModulos(this.user.empresa_id);
    }
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

    this.http.post('https://gestiva-pyme.onrender.com/api/user/avatar', { avatar_url: newAvatarUrl }, {
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



