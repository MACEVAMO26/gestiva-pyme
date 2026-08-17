import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccessibilityService } from '../../services/accessibility/accessibility.service';
import { ModulosService, MODULOS_BASE_UI, RUTA_MODULO, ICONO_MODULO } from '../../services/modulos.service';
import { ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  // --- VARIABLES DE ESTADO ---
  user: any = null;
  planActual: string = 'Especial';

  modulosSidebar: ModuloSidebar[] = [];
  isSidebarCollapsed = false;
  hasNotification = false;

  constructor() {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.construirSidebar();
  }

  // --- LÓGICA DEL SIDEBAR (CATÁLOGO REAL DESDE LA BD) ---
  private construirSidebar() {
    // Módulos base del producto SIEMPRE visibles (Inicio, Administración, etc.)
    const botones: { [key: string]: ModuloSidebar } = {};
    MODULOS_BASE_UI.forEach((mod) => {
      botones[mod.id] = {
        id: mod.id,
        nombre: mod.nombre,
        icono: mod.icono,
        ruta: `./${mod.ruta}`
      };
    });

    // Plan según el tipo de empresa real del usuario
    const tipoEmpresaUsuario = this.user?.empresa?.tipo_empresa || 'Especial';
    this.planActual = this.calcularPlan(tipoEmpresaUsuario);

    // Pintar de inmediato los módulos base sin esperar HTTP
    this.aplicarOrdenamiento(botones);

    // Consultar los módulos reales asignados al usuario (autenticado)
    if (this.user?.empresa_id) {
      this.modulosService.getMisModulos().subscribe({
        next: (resp) => {
          const modulosEmpresa = resp.modulos || {};

          // --- RECONSTRUIR BOTONES DESDE CERO CON LA VERDAD DE LA BASE DE DATOS ---
          const botonesReales: { [key: string]: ModuloSidebar } = {};
          MODULOS_BASE_UI.forEach((mod) => {
            botonesReales[mod.id] = {
              id: mod.id,
              nombre: mod.nombre,
              icono: mod.icono,
              ruta: `./${mod.ruta}`
            };
          });

          Object.keys(modulosEmpresa).forEach((paqueteId) => {
            // Forzamos que si es Ventas no cargue Servicios, y viceversa
            if (tipoEmpresaUsuario === 'Ventas' && paqueteId === 'servicios') return;
            if (tipoEmpresaUsuario === 'Servicios' && paqueteId === 'ventas') return;

            const subs = modulosEmpresa[paqueteId] || [];

            if (paqueteId === 'ventas' || paqueteId === 'servicios') {
              // Desglosar submódulos individuales que estén ACTIVOS en la BD
              subs.forEach((sub: any) => {
                if (sub.activo) {
                  botonesReales[sub.id] = {
                    id: sub.id,
                    nombre: sub.nombre,
                    icono: ICONO_MODULO[sub.id] || 'fas fa-circle',
                    ruta: `./${RUTA_MODULO[sub.id] || this.slugify(sub.nombre)}`
                  };
                }
              });
            } else if (['rrhh', 'finanzas', 'addons', 'base'].includes(paqueteId)) {
              // Módulo completo: revisar si tiene algún submódulo ACTIVO en la BD real
              const isActivo = subs.some((s: any) => s.activo);
              if (isActivo) {
                let id = paqueteId;
                let nombre = paqueteId === 'rrhh' ? 'Gestión Humana' : (paqueteId === 'finanzas' ? 'Finanzas' : (paqueteId === 'addons' ? 'Addons+' : ''));
                let ruta = `./${this.slugify(nombre)}`;
                if (paqueteId === 'base') {
                  // El paquete 'base' de la BD (Recordatorios, Reuniones, etc.) no genera botón propio
                  return;
                }
                botonesReales[id] = {
                  id,
                  nombre,
                  icono: ICONO_MODULO[id] || 'fas fa-circle',
                  ruta
                };
              }
            }
          });

          this.aplicarOrdenamiento(botonesReales);
        },
        error: () => this.aplicarOrdenamiento(botones) // Si falla, mantener los módulos base
      });
    } else {
      // Si no tiene empresa (caso inusual en cliente), mantener módulos base
      this.aplicarOrdenamiento(botones);
    }
  }

  // Plan según el tipo de empresa
  private calcularPlan(tipoEmpresaUsuario: string): string {
    if (tipoEmpresaUsuario.includes('Ventas y Servicios') || tipoEmpresaUsuario === 'Mixto') return 'Mixto';
    if (tipoEmpresaUsuario === 'Ventas') return 'Ventas';
    if (tipoEmpresaUsuario === 'Servicios') return 'Servicios';
    return 'Especial';
  }

  private aplicarOrdenamiento(botones: { [key: string]: ModuloSidebar }) {
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
    this.cdr.detectChanges();
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
