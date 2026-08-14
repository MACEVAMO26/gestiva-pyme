import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccessibilityService } from '../../services/accessibility/accessibility.service';
import { ModulosService } from '../../services/modulos.service';
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
        const botones: { [key: string]: ModuloSidebar } = {};
        
        // 1. Agregar los módulos 'default' siempre (Inicio, Administración, Tareas, etc.)
        const defaultPkg = catalogo.find((p: any) => p.id === 'default');
        if (defaultPkg && defaultPkg.submodulos) {
          defaultPkg.submodulos.forEach((sub: any) => {
            botones[sub.id] = {
              id: sub.id,
              nombre: sub.nombre,
              icono: sub.icono || 'fas fa-circle',
              ruta: `./${this.slugify(sub.nombre)}`
            };
          });
        }

        // 2. Sembrar al instante con los módulos activos guardados en el login (sin esperar HTTP)
        const modulosActivos = this.authService.getModulosActivos() || {};
        const tipoEmpresaUsuario = (this.user?.empresa as any)?.tipo_empresa || 'Mixto';

        catalogo.forEach((paquete: any) => {
          if (paquete.id === 'default') return;

          // Si el tipo de empresa es estrictamente Ventas o Servicios, ignoramos el otro paquete
          if (tipoEmpresaUsuario === 'Ventas' && paquete.id === 'servicios') return;
          if (tipoEmpresaUsuario === 'Servicios' && paquete.id === 'ventas') return;

          if (paquete.id === 'ventas' || paquete.id === 'servicios') {
            if (paquete.submodulos && Array.isArray(paquete.submodulos)) {
              paquete.submodulos.forEach((sub: any) => {
                if (modulosActivos[sub.id]) {
                  botones[sub.id] = {
                    id: sub.id,
                    nombre: sub.nombre,
                    icono: sub.icono || 'fas fa-circle',
                    ruta: `./${this.slugify(sub.nombre)}`
                  };
                }
              });
            }
          } else if (paquete.id === 'rrhh' || paquete.id === 'finanzas' || paquete.id === 'addons') {
            const hayActivo = (paquete.submodulos || []).some((sub: any) => modulosActivos[sub.id]);
            if (hayActivo) {
              let nombre = paquete.nombre;
              if (paquete.id === 'rrhh') nombre = 'Gestión Humana';
              if (paquete.id === 'finanzas') nombre = 'Finanzas';

              botones[paquete.id] = {
                id: paquete.id,
                nombre: nombre,
                icono: paquete.icono || 'fas fa-circle',
                ruta: `./${this.slugify(nombre)}`
              };
            }
          }
        });

        // Plan instantáneo según tipo de empresa real
        if (tipoEmpresaUsuario.includes('Ventas y Servicios') || tipoEmpresaUsuario === 'Mixto') {
          this.planActual = 'Mixto';
        } else if (tipoEmpresaUsuario === 'Ventas') {
          this.planActual = 'Ventas';
        } else if (tipoEmpresaUsuario === 'Servicios') {
          this.planActual = 'Servicios';
        } else {
          this.planActual = 'Especial';
        }

        // Pintar de inmediato (base + comprados) sin esperar la llamada HTTP
        this.aplicarOrdenamiento(botones);

        // 3. Si el usuario pertenece a una empresa, consultar los módulos asignados a esa empresa
        if (this.user?.empresa_id) {
          this.modulosService.getModulosPorEmpresa(this.user.empresa_id).subscribe({
            next: (resp) => {
              const modulosEmpresa = resp.modulos || {};

              // --- RECONSTRUIR BOTONES DESDE CERO CON LA VERDAD DE LA BASE DE DATOS ---
              const botonesReales: { [key: string]: ModuloSidebar } = {};
              
              // 1. Re-agregar los módulos 'default' siempre
              if (defaultPkg && defaultPkg.submodulos) {
                defaultPkg.submodulos.forEach((sub: any) => {
                  botonesReales[sub.id] = {
                    id: sub.id,
                    nombre: sub.nombre,
                    icono: sub.icono || 'fas fa-circle',
                    ruta: `./${this.slugify(sub.nombre)}`
                  };
                });
              }

              catalogo.forEach((paquete: any) => {
                if (paquete.id === 'default') return;

                // Forzamos que si es Ventas no cargue Servicios, y viceversa, 
                // incluso si en la BD quedaron activos residuales.
                if (tipoEmpresaUsuario === 'Ventas' && paquete.id === 'servicios') return;
                if (tipoEmpresaUsuario === 'Servicios' && paquete.id === 'ventas') return;

                const estadoPaquete = (modulosEmpresa as any)[paquete.id] || [];

                if (paquete.id === 'ventas' || paquete.id === 'servicios') {
                  // Desglosar submódulos
                  if (paquete.submodulos && Array.isArray(paquete.submodulos)) {
                    paquete.submodulos.forEach((sub: any) => {
                      // Verificar si está ACTIVO en la BD real
                      const moduloActivoDb = estadoPaquete.find((s: any) => s.id === sub.id)?.activo;
                      if (moduloActivoDb) {
                        botonesReales[sub.id] = {
                          id: sub.id,
                          nombre: sub.nombre,
                          icono: sub.icono || 'fas fa-circle',
                          ruta: `./${this.slugify(sub.nombre)}`
                        };
                      }
                    });
                  }
                } else if (paquete.id === 'rrhh' || paquete.id === 'finanzas' || paquete.id === 'addons') {
                  // Módulo completo: revisar si tiene algún submódulo ACTIVO en la BD real
                  const isActivo = estadoPaquete.some((s: any) => s.activo);
                  if (isActivo) {
                    let nombre = paquete.nombre;
                    if (paquete.id === 'rrhh') nombre = 'Gestión Humana';
                    if (paquete.id === 'finanzas') nombre = 'Finanzas';
                    
                    botonesReales[paquete.id] = {
                      id: paquete.id,
                      nombre: nombre,
                      icono: paquete.icono || 'fas fa-circle',
                      ruta: `./${this.slugify(nombre)}`
                    };
                  }
                }
              });

              // La etiqueta del plan se mantiene igual al tipo de empresa principal
              if (tipoEmpresaUsuario.includes('Ventas y Servicios') || tipoEmpresaUsuario === 'Mixto') {
                this.planActual = 'Mixto';
              } else if (tipoEmpresaUsuario === 'Ventas') {
                this.planActual = 'Ventas';
              } else if (tipoEmpresaUsuario === 'Servicios') {
                this.planActual = 'Servicios';
              } else {
                this.planActual = 'Especial';
              }

              this.aplicarOrdenamiento(botonesReales);
            },
            error: () => this.aplicarOrdenamiento(botones) // Si falla, mantener los cacheados
          });
        } else {
          // Si no tiene empresa (caso inusual en cliente), mantener cacheados
          this.aplicarOrdenamiento(botones);
        }
      },
      error: () => {
        // Si falla la carga del catálogo completo
        this.modulosSidebar = [
          { id: 'd_ini', nombre: 'Inicio', icono: 'fas fa-home', ruta: './inicio' }
        ];
      }
    });
  }

  // Plan según los módulos activos: Mixto = Ventas Y Servicios, Especial = ninguno
  private calcularPlanDesde(estaActivo: (id: string) => boolean): string {
    const idsVentas = ['v_pos', 'v_inv', 'v_cxc', 'v_rep', 'v_prov'];
    const idsServicios = ['s_age', 's_crm', 's_cat', 's_ope', 's_rep'];
    const tieneVentas = idsVentas.some(id => estaActivo(id));
    const tieneServicios = idsServicios.some(id => estaActivo(id));
    if (tieneVentas && tieneServicios) return 'Mixto';
    if (tieneVentas) return 'Ventas';
    if (tieneServicios) return 'Servicios';
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
