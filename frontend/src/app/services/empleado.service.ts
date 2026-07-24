import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  private apiUrl = '/api';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Obtener headers de autorización
  private getHeaders() {
    return {
      headers: {
        Authorization: `Bearer ${this.authService.getToken()}`
      }
    };
  }

  // --- GESTIÓN HUMANA ---
  
  // Trae los usuarios "cáscara" pendientes de formalizar
  getPendientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empleados/pendientes`, this.getHeaders());
  }

  // Trae los empleados ya formalizados
  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empleados`, this.getHeaders());
  }

  // Formaliza un usuario y lo convierte en empleado
  formalizarEmpleado(usuarioId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/empleados/${usuarioId}/formalizar`, data, this.getHeaders());
  }

  // Despide / Da de baja a un empleado
  solicitarBaja(empleadoId: number, motivo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/empleados/${empleadoId}/solicitar-baja`, { motivo }, this.getHeaders());
  }

  aprobarBaja(empleadoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/empleados/${empleadoId}/aprobar-baja`, {}, this.getHeaders());
  }

  // --- Cargos, Áreas y Roles (Listados para el formulario) ---
  private cargos$?: Observable<any[]>;
  getCargos(): Observable<any[]> {
    if (!this.cargos$) {
      this.cargos$ = this.http.get<any[]>(`${this.apiUrl}/cargos`, this.getHeaders()).pipe(shareReplay(1));
    }
    return this.cargos$;
  }

  // Asumimos que existe un endpoint /areas en api.php
  // Si no existe, lo tendremos que crear o usar roles provisionalmente
  private areas$?: Observable<any[]>;
  getAreas(): Observable<any[]> {
    if (!this.areas$) {
      this.areas$ = this.http.get<any[]>(`${this.apiUrl}/areas`, this.getHeaders()).pipe(shareReplay(1));
    }
    return this.areas$;
  }

  private roles$?: Observable<any[]>;
  getRoles(): Observable<any[]> {
    if (!this.roles$) {
      this.roles$ = this.http.get<any[]>(`${this.apiUrl}/roles`, this.getHeaders()).pipe(shareReplay(1));
    }
    return this.roles$;
  }
}
