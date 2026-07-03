import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AccessibilityService, DaltonismMode } from '../../../services/accessibility/accessibility.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  // Credenciales
  credentials = {
    email: '',
    password: ''
  };

  suspendedMessage = '';

  // UI State
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Accesibilidad
  isAccessibilityMenuOpen = false;
  
  // Servicios
  private authService = inject(AuthService);
  private router = inject(Router);
  public accessibilityService = inject(AccessibilityService);

  // MenÃº Accesibilidad
  toggleAccessibilityMenu() {
    this.isAccessibilityMenuOpen = !this.isAccessibilityMenuOpen;
  }

  // Filtros Daltonismo
  setDaltonismMode(mode: DaltonismMode) {
    this.accessibilityService.setMode(mode);
    this.isAccessibilityMenuOpen = false;
  }

  // Cambio de Clave
  requiresPasswordChange = false;
  changePasswordData = {
    newPassword: ''
  };

  // AutenticaciÃ³n
  onSubmit(): void {
    if (this.requiresPasswordChange) {
      this.submitNewPassword();
      return;
    }

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response.requires_password_change) {
          this.requiresPasswordChange = true;
          alert(response.message);
          return;
        }

        // LÃ³gica de ruteo universal (SaaS Master vs Cliente)
        const user = response.user;
        if (user && user.empresa_id === null) {
          this.router.navigate(['/saas-admin']); // Redirigir al panel de la dueÃ±a
        } else {
          this.router.navigate(['/dashboard']);  // Redirigir al panel del cliente
        }
      },
      error: (err) => {
        if (err.error && err.error.errors) {
          const errors = err.error.errors;
          if (errors.system_suspended) {
            this.suspendedMessage = errors.system_suspended[0];
            return;
          }
          if (errors.email) {
            alert(errors.email[0]);
            return;
          }
        }
        alert('Credenciales incorrectas o error en el servidor.');
      }
    });
  }

  submitNewPassword(): void {
    const payload = {
      email: this.credentials.email,
      current_password: this.credentials.password, // El documento que ingresÃ³
      new_password: this.changePasswordData.newPassword
    };

    this.authService.changeInitialPassword(payload).subscribe({
      next: (response) => {
        alert(response.message);
        // Forzar la recarga completa para volver al estado inicial del login
        window.location.reload();
      },
      error: (err) => {
        if (err.error && err.error.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          alert(firstError[0]);
        } else {
          alert('OcurriÃ³ un error al cambiar la contraseÃ±a. AsegÃºrate de cumplir con los requisitos.');
        }
      }
    });
  }
}

