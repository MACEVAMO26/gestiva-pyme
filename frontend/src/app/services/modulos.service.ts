import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Submodulo {
  id: string;
  nombre: string;
  activo: boolean;
  asignado: boolean;
}

export interface PaquetesRespuesta {
  ventas?: Submodulo[];
  servicios?: Submodulo[];
  finanzas?: Submodulo[];
  rrhh?: Submodulo[];
  addons?: Submodulo[];
}

@Injectable({
  providedIn: 'root'
})
export class ModulosService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  private getHeaders() { 
    const token = sessionStorage.getItem('auth_token'); 
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  getModulosPorEmpresa(empresaId: string | number): Observable<{ modulos: PaquetesRespuesta }> {
    return this.http.get<{ modulos: PaquetesRespuesta }>(`${this.apiUrl}/empresas/${empresaId}/modulos`, this.getHeaders());
  }

  toggleModulo(empresaId: string | number, moduloId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/empresas/${empresaId}/modulos/${moduloId}/toggle`, {}, this.getHeaders());
  }

  updatePaqueteEmpresa(empresaId: string | number, modulosState: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/empresas/${empresaId}/modulos/paquete`, { modulos: modulosState }, this.getHeaders());
  }

  // Obtenemos el catálogo base de módulos (listo para conectarse a un API externa de catálogo)
  getCatalogoModulos(): Observable<any[]> {
    // Simula una respuesta de API con el catálogo de módulos
    const mockCatalogo = [
      {
        id: 'default',
        nombre: 'Módulos Por Defecto',
        descripcion: 'Módulos esenciales que siempre están activos.',
        icono: 'fas fa-home',
        color: 'gray',
        activo: true,
        submodulos: [
          { id: 'd_ini', nombre: 'Inicio', activo: true, icono: 'fas fa-home' },
          { id: 'd_adm', nombre: 'Administración', activo: true, icono: 'fas fa-cog' },
          { id: 'd_tar', nombre: 'Gestión de Tareas', activo: true, icono: 'fas fa-tasks' },
          { id: 'd_gia', nombre: 'Gestiva IA', activo: true, icono: 'fas fa-robot' },
          { id: 'd_aut', nombre: 'Autogestión', activo: true, icono: 'fas fa-user-circle' },
        ],
      },
      {
        id: 'ventas',
        nombre: 'Paquete VENTAS',
        descripcion: 'Para comercios y tiendas de productos físicos.',
        icono: 'fas fa-shopping-cart',
        color: 'blue',
        activo: false,
        submodulos: [
          { id: 'v_pos', nombre: 'Ventas', activo: false, icono: 'fas fa-store' },
          { id: 'v_inv', nombre: 'Inventario', activo: false, icono: 'fas fa-boxes' },
          { id: 'v_cxc', nombre: 'Clientes', activo: false, icono: 'fas fa-address-book' },
          { id: 'v_rep', nombre: 'Compras', activo: false, icono: 'fas fa-shopping-basket' },
          { id: 'v_prov', nombre: 'Proveedores', activo: false, icono: 'fas fa-truck' },
        ],
      },
      {
        id: 'servicios',
        nombre: 'Paquete SERVICIOS',
        descripcion: 'Para agendas, barberías, consultorios y talleres.',
        icono: 'fas fa-calendar-alt',
        color: 'purple',
        activo: false,
        submodulos: [
          { id: 's_age', nombre: 'Agenda', activo: false, icono: 'fas fa-calendar-check' },
          { id: 's_crm', nombre: 'Gestión de Clientes', activo: false, icono: 'fas fa-handshake' },
          { id: 's_cat', nombre: 'Servicios', activo: false, icono: 'fas fa-list' },
          { id: 's_ope', nombre: 'Gestión de Operarios', activo: false, icono: 'fas fa-user-cog' },
          { id: 's_rep', nombre: 'Reportes', activo: false, icono: 'fas fa-chart-line' },
        ],
      },
      {
        id: 'finanzas',
        nombre: 'FINANZAS',
        descripcion: 'Registro de pagos y cobro por servicios o productos.',
        icono: 'fas fa-cash-register',
        color: 'yellow',
        activo: false,
        submodulos: [{ id: 'f_caja', nombre: 'Caja y Pre-facturación', activo: false, icono: 'fas fa-cash-register' }],
      },
      {
        id: 'rrhh',
        nombre: 'GESTIÓN HUMANA',
        descripcion: 'Gestión de empleados, turnos y vacaciones. Disponible para todos.',
        icono: 'fas fa-users',
        color: 'indigo',
        activo: false,
        submodulos: [
          { id: 'r_tur', nombre: 'Horarios y Turnos', activo: false, icono: 'fas fa-clock' },
          { id: 'r_aus', nombre: 'Horas Extras y Ausencias', activo: false, icono: 'fas fa-user-clock' },
          { id: 'r_vac', nombre: 'Gestión de Vacaciones', activo: false, icono: 'fas fa-umbrella-beach' }
        ],
      },
      {
        id: 'addons',
        nombre: 'Addons+',
        descripcion: 'Conectores y herramientas extra que se cobran por separado.',
        icono: 'fas fa-plug',
        color: 'green',
        activo: false,
        submodulos: [
          { id: 'a_contable', nombre: 'Conector Contable', activo: false, icono: 'fas fa-file-invoice-dollar' },
        ],
      },
    ];
    return of(mockCatalogo);
  }

  // CRUD Global de Módulos (Catálogo)
  crearModuloGlobal(id: string, nombre: string, paquete: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/modulos`, { id, nombre, paquete }, this.getHeaders());
  }

  editarModuloGlobal(id: string, nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/modulos/${id}`, { nombre }, this.getHeaders());
  }

  eliminarModuloGlobal(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/modulos/${id}`, this.getHeaders());
  }
}
