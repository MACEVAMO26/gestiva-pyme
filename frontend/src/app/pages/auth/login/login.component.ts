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

  // --- VARIABLES DE ESTADO ---
  credentials = {
    email: '',
    password: ''
  };
  suspendedMessage = '';
  showPassword = false;
  isAccessibilityMenuOpen = false;
  requiresPasswordChange = false;
  changePasswordData = {
    newPassword: ''
  };

  private authService = inject(AuthService);
  private router = inject(Router);
  public accessibilityService = inject(AccessibilityService);

  // Alterna la visibilidad de la contraseña en el formulario
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Abre o cierra el menú de opciones de accesibilidad
  toggleAccessibilityMenu() {
    this.isAccessibilityMenuOpen = !this.isAccessibilityMenuOpen;
  }

  // Aplica el filtro de daltonismo seleccionado
  setDaltonismMode(mode: DaltonismMode) {
    this.accessibilityService.setMode(mode);
    this.isAccessibilityMenuOpen = false;
  }

  // Procesa el formulario de login y redirige según el rol
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

        const user = response.user;
        if (user && user.empresa_id === null) {
          this.router.navigate(['/saas-admin']);
        } else {
          this.router.navigate(['/dashboard']);
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

  // Envía la nueva contraseña para forzar el cambio inicial
  submitNewPassword(): void {
    const payload = {
      email: this.credentials.email,
      current_password: this.credentials.password,
      new_password: this.changePasswordData.newPassword
    };

    this.authService.changeInitialPassword(payload).subscribe({
      next: (response) => {
        alert(response.message);
        window.location.reload();
      },
      error: (err) => {
        if (err.error && err.error.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          alert(firstError[0]);
        } else {
          alert('Ocurrió un error al cambiar la contraseña. Asegúrate de cumplir con los requisitos.');
        }
      }
    });
  }
}

