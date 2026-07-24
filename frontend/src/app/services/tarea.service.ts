import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tarea {
  id?: number;
  titulo: string;
  descripcion: string;
  asignador_id?: number;
  asignado_id: number;
  estado?: 'notificada' | 'en_proceso' | 'terminada';
  empresa_id?: number;
  created_at?: string;
  asignador?: { nombres: string, apellidos: string };
  asignado?: { nombres: string, apellidos: string };
}

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private http = inject(HttpClient);
  private apiUrl = '/api/tareas';

  getTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(this.apiUrl);
  }

  crearTarea(tarea: any): Observable<any> {
    return this.http.post(this.apiUrl, tarea);
  }

  actualizarEstado(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
