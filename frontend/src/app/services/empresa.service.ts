import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private http = inject(HttpClient);
  // Usa la ruta que definiste en Laravel API
  private apiUrl = 'https://gestiva-pyme.onrender.com/api/empresas';

  // Obtener todas las empresas
  private getHeaders() { const token = sessionStorage.getItem('auth_token'); return new HttpHeaders().set('Authorization', `Bearer ${token}`); }

  getEmpresas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getSuscripcionesStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/suscripciones`, { headers: this.getHeaders() });
  }

  getSystemStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/system`, { headers: this.getHeaders() });
  }

  // Crear una nueva empresa
  createEmpresa(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  // Actualizar una empresa existente
  updateEmpresa(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  // Actualizar tarifas (descuentos, extras, addons)
  updateTarifas(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/tarifas`, data, { headers: this.getHeaders() });
  }

  // Cambiar estado activo/inactivo
  renovarSuscripcion(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/renovar`, {}, { headers: this.getHeaders() });
  }

  noRenovarSuscripcion(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/norenovar`, {}, { headers: this.getHeaders() });
  }

  toggleStatus(id: number, accion: string = ''): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { accion }, { headers: this.getHeaders() });
  }
}


