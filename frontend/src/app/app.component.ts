import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'frontend';

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Aterrizaje Forzoso en el Dashboard al cargar la aplicación si hay sesión.
    if (this.authService.getToken()) {
      const user = this.authService.getUser();
      if (user) {
        if (user.empresa_id === null) {
          this.router.navigate(['/saas-admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }
    }
  }
}