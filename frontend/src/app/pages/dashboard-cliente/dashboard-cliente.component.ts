import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccessibilityService } from '../../services/accessibility/accessibility.service';
import { ModulosService } from '../../services/modulos.service';
import { GestivaIaTutorialComponent } from '../../shared/components/gestiva-ia-tutorial/gestiva-ia-tutorial.component';
import { GestivaBotComponent } from '../../shared/components/gestiva-bot/gestiva-bot';

interface ModuloSidebar {
  id: string;
  nombre: string;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule, GestivaIaTutorialComponent, GestivaBotComponent],
  templateUrl: './dashboard-cliente.component.html',
  styleUrl: './dashboard-cliente.component.scss'
})
export class DashboardClienteComponent implements OnInit {
  // --- SERVICIOS ---
  public accessibilityService = inject(AccessibilityService);
  private authService = inject(AuthService);
  private modulosService = inject(ModulosService);
  private router = inject(Router);

  // --- VARIABLES DE ESTADO ---
  user: any = null;
  planActual: string = 'Premium'; // Simulado

  modulosSidebar: ModuloSidebar[] = [];
  isSidebarCollapsed = false;
  hasNotification = true; // Para demostrar el efecto de la campanita girada y roja

  constructor() {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.construirSidebar();
  }

  // --- LÓGICA DEL SIDEBAR (CATÁLOGO REAL) ---
  private construirSidebar() {
    this.modulosService.getCatalogoModulos().subscribe({
      next: (catalogo) => {
        // Almacenamos temporalmente los botones creados para luego ordenarlos
        const botones: { [key: string]: ModuloSidebar } = {};
        
        catalogo.forEach((paquete: any) => {
          if (paquete.id === 'default' || paquete.id === 'ventas' || paquete.id === 'servicios') {
            // Desglosar
            if (paquete.submodulos && Array.isArray(paquete.submodulos)) {
              paquete.submodulos.forEach((sub: any) => {
                botones[sub.id] = {
                  id: sub.id,
                  nombre: sub.nombre,
                  icono: sub.icono || 'fas fa-circle',
                  ruta: `./${this.slugify(sub.nombre)}`
                };
              });
            }
          } else if (paquete.id === 'rrhh' || paquete.id === 'finanzas' || paquete.id === 'addons') {
            // Módulo completo
            let nombre = paquete.nombre;
            // Estandarizar nombre para evitar mayúsculas exageradas
            if (paquete.id === 'rrhh') nombre = 'Gestión Humana';
            if (paquete.id === 'finanzas') nombre = 'Finanzas';
            
            botones[paquete.id] = {
              id: paquete.id,
              nombre: nombre,
              icono: paquete.icono || 'fas fa-circle',
              ruta: `./${this.slugify(nombre)}`
            };
          }
        });

        // Aplicamos el orden estricto dictado por el usuario
        const ordenDeseado = [
          'd_ini', // Inicio
          'd_adm', // Administración
          'd_tar', // Gestión de Tareas
          'd_gia', // Gestiva IA
          'rrhh',  // Gestión Humana
          'v_prov', // Proveedores
          'v_rep',  // Compras
          'v_inv',  // Inventario
          'v_pos',  // Ventas
          'v_cxc',  // Clientes
          's_age',  // Agenda
          's_crm',  // Gestión de Clientes
          's_cat',  // Servicios
          's_ope',  // Gestión de Operarios
          's_rep',  // Reportes
          'finanzas', // Finanzas
          'd_aut',  // Autogestión
          'addons'  // Addons+
        ];

        let itemsOrdenados: ModuloSidebar[] = [];
        
        const esGerente = this.user?.rol?.nombre === 'Gerente General' || this.user?.rol?.nombre === 'Gerente';

        ordenDeseado.forEach(id => {
          if (id === 'd_gia' && !esGerente) {
              // Ocultar Gestiva IA (directrices) a los empleados
              return;
          }
          if (botones[id]) {
            itemsOrdenados.push(botones[id]);
          }
        });

        this.modulosSidebar = itemsOrdenados;
      },
      error: () => {
        // Si falla la carga del catálogo, mostrar al menos el módulo de inicio
        this.modulosSidebar = [
          { id: 'd_ini', nombre: 'Inicio', icono: 'fas fa-home', ruta: './inicio' }
        ];
      }
    });
  }

  private slugify(text: string): string {
    if (!text) return '';
    return text.toString().toLowerCase()
      .normalize('NFD')                   // split an accented letter in the base letter and the accent
      .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
      .replace(/\s+/g, '-')              // replace spaces with -
      .replace(/[^\w\-]+/g, '')          // remove all non-word chars
      .replace(/\-\-+/g, '-')            // replace multiple - with single -
      .replace(/^-+/, '')                // trim - from start of text
      .replace(/-+$/, '');               // trim - from end of text
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleNotification() {
    this.hasNotification = !this.hasNotification;
  }

  toggleDaltonism(): void {
    const current = this.accessibilityService.currentMode();
    const modes: ('normal' | 'protanopia' | 'deuteranopia' | 'tritanopia')[] = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];
    const currentIndex = modes.indexOf(current);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.accessibilityService.setMode(modes[nextIndex]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
