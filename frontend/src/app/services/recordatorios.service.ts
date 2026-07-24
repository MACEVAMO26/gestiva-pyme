import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recordatorio {
  id: number;
  titulo: string;
  descripcion: string;
  completado: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecordatoriosService {
  private apiUrl = '/api/recordatorios';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = sessionStorage.getItem('auth_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  getRecordatorios(): Observable<Recordatorio[]> {
    return this.http.get<Recordatorio[]>(this.apiUrl, this.getHeaders());
  }

  agregarRecordatorio(descripcion: string): Observable<Recordatorio> {
    const payload = {
      titulo: 'Recordatorio',
      descripcion: descripcion
    };
    return this.http.post<Recordatorio>(this.apiUrl, payload, this.getHeaders());
  }

  eliminarRecordatorio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}
