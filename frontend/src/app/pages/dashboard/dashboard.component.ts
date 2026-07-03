import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AccessibilityService, DaltonismMode } from '../../services/accessibility/accessibility.service';
import { ModulosService } from '../../services/modulos.service';
import { CommonModule } from '@angular/common';
import { EmpleadosComponent } from './empleados/empleados.component';
import { AdministracionComponent } from './administracion/administracion.component';
import { PagosComponent } from './pagos/pagos.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EmpleadosComponent, AdministracionComponent, PagosComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  user: any = null;
  public accessibilityService = inject(AccessibilityService);
  isAccessibilityMenuOpen = false;

  // Permisos de mÃ³dulos
  hasVentas = false;
  hasServicios = false;
  modulosActivos: Record<string, boolean> = {};
  private modulosService = inject(ModulosService);

  // Estado del Sidebar y MÃ³dulo Actual
  isSidebarCollapsed = false;
  currentModule = 'inicio';
  isCompanyInactive = false;

  // Tipo de empresa para estilos
  tipoEmpresa = '';
  tipoEmpresaClass = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    
    // Determinar quÃ© mÃ³dulos tiene activos su empresa
    if (this.user && this.user.empresa) {
      const tipo = this.user.empresa.tipo_empresa;
      this.tipoEmpresa = tipo;
      this.tipoEmpresaClass = tipo === 'Ventas y Servicios' ? 'mixto' : tipo.toLowerCase();
      this.hasVentas = tipo === 'Ventas' || tipo === 'Ventas y Servicios';
      this.hasServicios = tipo === 'Servicios' || tipo === 'Ventas y Servicios';
      
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
        console.error('Error al cargar mÃ³dulos del Dashboard:', err);
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

  logout(): void {
    this.authService.logout();
  }
}

