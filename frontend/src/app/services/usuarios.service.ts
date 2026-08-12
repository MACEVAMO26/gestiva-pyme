import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = '/api/usuarios';

  private getHeaders() { 
    const token = sessionStorage.getItem('auth_token'); 
    return new HttpHeaders().set('Authorization', `Bearer ${token}`); 
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  createUsuario(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  updateUsuario(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  changeStatus(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, {}, { headers: this.getHeaders() });
  }
}
