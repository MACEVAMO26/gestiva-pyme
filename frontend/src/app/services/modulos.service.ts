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
  private apiUrl = 'http://127.0.0.1:8000/api';

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
        id: 'ventas',
        nombre: 'Paquete VENTAS',
        descripcion: 'Para comercios y tiendas de productos físicos.',
        icono: 'fas fa-shopping-cart',
        color: 'blue',
        activo: false,
        submodulos: [
          { id: 'v_pos', nombre: 'Interfaz de Venta Rápida (POS)', activo: false },
          { id: 'v_inv', nombre: 'Inventario y Alertas', activo: false },
          { id: 'v_cxc', nombre: 'Cuentas por Cobrar (Cartera)', activo: false },
          { id: 'v_rep', nombre: 'Reportes de Ventas', activo: false },
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
          { id: 's_age', nombre: 'Agenda y Calendario', activo: false },
          { id: 's_crm', nombre: 'CRM (Gestión de Clientes)', activo: false },
          { id: 's_cat', nombre: 'Catálogo de Servicios', activo: false },
          { id: 's_ope', nombre: 'Gestión de Operarios', activo: false },
          { id: 's_rep', nombre: 'Reportes de Servicios', activo: false },
        ],
      },
      {
        id: 'finanzas',
        nombre: 'Transversal: Caja y Facturación',
        descripcion: 'Registro de pagos y cobro por servicios o productos.',
        icono: 'fas fa-cash-register',
        color: 'yellow',
        activo: false,
        submodulos: [{ id: 'f_caja', nombre: 'Caja y Pre-facturación', activo: false }],
      },
      {
        id: 'rrhh',
        nombre: 'Transversal: RRHH (Personal)',
        descripcion: 'Gestión de empleados, turnos y vacaciones. Disponible para todos.',
        icono: 'fas fa-users',
        color: 'indigo',
        activo: false,
        submodulos: [
          { id: 'r_tur', nombre: 'Horarios y Turnos', activo: false },
          { id: 'r_aus', nombre: 'Control de Horas Extras y Ausencias', activo: false },
          { id: 'r_vac', nombre: 'Gestión de Vacaciones', activo: false }
        ],
      },
      {
        id: 'addons',
        nombre: 'Módulos Adicionales (Add-ons)',
        descripcion: 'Conectores y herramientas extra que se cobran por separado.',
        icono: 'fas fa-plug',
        color: 'green',
        activo: false,
        submodulos: [
          { id: 'a_contable', nombre: 'Conector Contable', activo: false },
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
