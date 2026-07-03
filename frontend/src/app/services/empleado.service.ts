import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  private apiUrl = 'http://127.0.0.1:8000/api';
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

  // --- Empleados (Usuarios) ---
  getEmpleados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, this.getHeaders());
  }

  createEmpleado(empleado: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios`, empleado, this.getHeaders());
  }

  updateEmpleado(id: number, empleado: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, empleado, this.getHeaders());
  }

  toggleStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/usuarios/${id}/status`, {}, this.getHeaders());
  }

  // --- Cargos y Roles (Listados para el formulario) ---
  getCargos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cargos`, this.getHeaders());
  }

  getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roles`, this.getHeaders());
  }
}
