import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
