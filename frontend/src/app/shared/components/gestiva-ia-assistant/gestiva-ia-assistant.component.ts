import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IaStateService } from '../../../services/ia-state/ia-state.service';

@Component({
  selector: 'app-gestiva-ia-assistant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestiva-ia-assistant.html',
  styleUrl: './gestiva-ia-assistant.scss'
})
export class GestivaIaAssistantComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private iaStateService = inject(IaStateService);

  mostrarGlobo = false;
  sugerencias: string[] = [];
  private routerSub!: Subscription;
  private autoHideTimeout: any;

  ngOnInit() {
    // Pedimos sugerencias iniciales al cargar
    this.fetchSugerencias();

    // Nos suscribimos a los cambios de ruta para pedir nuevas sugerencias
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.fetchSugerencias();
    });
  }

  fetchSugerencias() {
    // Determinar area basandose en la URL (muy basico)
    let area = 'general';
    const url = this.router.url;
    
    if (url.includes('ventas')) {
      area = 'ventas';
    } else if (url.includes('tareas')) {
      area = 'tareas';
    } else if (url.includes('empleados')) {
      area = 'empleados';
    }

    this.http.get<{sugerencias: string[], area: string, rol: string}>(`/api/ia/sugerencias?area=${area}`).subscribe({
      next: (res) => {
        if (res.sugerencias && res.sugerencias.length > 0) {
          this.sugerencias = res.sugerencias;
          this.mostrarGlobo = true;

          // Ocultar globo automaticamente despues de 10 segundos
          if (this.autoHideTimeout) clearTimeout(this.autoHideTimeout);
          this.autoHideTimeout = setTimeout(() => {
            this.mostrarGlobo = false;
          }, 10000);
        }
      },
      error: (err) => {
        console.error('Error fetching IA sugerencias', err);
      }
    });
  }

  toggleGlobo() {
    this.mostrarGlobo = !this.mostrarGlobo;
    if (this.mostrarGlobo && this.sugerencias.length === 0) {
      this.fetchSugerencias();
    }
  }

  verTutorialDeNuevo() {
    this.mostrarGlobo = false;
    this.iaStateService.triggerTutorial();
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }
  }
}
