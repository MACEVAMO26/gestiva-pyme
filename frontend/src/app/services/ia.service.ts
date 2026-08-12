import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IaConfig {
  id?: number;
  empresa_id?: number;
  proveedor: string;
  api_key: string;
  is_active: boolean;
}

export interface IaChatHistory {
  id?: number;
  usuario_id?: number;
  rol: 'user' | 'assistant';
  mensaje: string;
  modo: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IaService {
  private http = inject(HttpClient);
  private apiUrl = '/api/ia';

  // --- CONFIGURACIÓN ---
  getConfiguracion(): Observable<IaConfig> {
    return this.http.get<IaConfig>(`${this.apiUrl}/config`);
  }

  guardarConfiguracion(config: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/config`, config);
  }

  // --- CHAT HISTORY ---
  getHistorialChat(): Observable<IaChatHistory[]> {
    return this.http.get<IaChatHistory[]>(`${this.apiUrl}/chat`);
  }

  enviarMensaje(mensaje: string, modo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat`, { mensaje, modo });
  }

  limpiarHistorial(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/chat`);
  }
}
