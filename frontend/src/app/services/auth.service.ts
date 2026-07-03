import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 1. URL base de nuestra API en Laravel
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // 2. Método para el inicio de sesión
  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Si requiere cambio de clave, NO guardamos token ni usuario todavía
        if (response.requires_password_change) {
          return;
        }

        // Si el login es exitoso y normal, guardamos el token y los datos del usuario
        if (response.token && response.user) {
          this.saveToken(response.token);
          this.saveUser(response.user);
        }
      })
    );
  }

  // 2.5 Método para cambiar contraseña inicial
  changeInitialPassword(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-initial-password`, data);
  }

  // 3. Método para cerrar sesión
  logout(): void {
    // Aquí podríamos llamar a la API para invalidar el token en el backend
    // this.http.post(`${this.apiUrl}/logout`, {}).subscribe();

    // Limpiamos el almacenamiento local
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('current_user');

    // Redirigimos al usuario a la página de login
    this.router.navigate(['/login']);
  }


  // --- Métodos de Ayuda (Helpers) para manejar el Local Storage ---

  // 4. Guardar el token en el Local Storage
  private saveToken(token: string): void {
    sessionStorage.setItem('auth_token', token);
  }

  // 5. Obtener el token del Local Storage
  getToken(): string | null {
    return sessionStorage.getItem('auth_token');
  }

  // 6. Guardar los datos del usuario en el Local Storage
  private saveUser(user: any): void {
    sessionStorage.setItem('current_user', JSON.stringify(user));
  }

  // 7. Obtener los datos del usuario del Local Storage
  getUser(): any | null {
    const user = sessionStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }
}