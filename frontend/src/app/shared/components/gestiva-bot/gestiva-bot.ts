import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-gestiva-bot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestiva-bot.html',
  styleUrls: ['./gestiva-bot.scss']
})
export class GestivaBotComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private http = inject(HttpClient);
  private routerSub!: Subscription;

  // Estados visuales
  showBubble = false;
  showChat = false;
  bubbleMessage = '';
  
  // Status de tutorial
  tutorialCounts: any = {
    empleados: 0,
    productos: 0,
    clientes: 0,
    ventas: 0,
    inventario: 0
  };

  currentModule = '';
  hasChecked = false;

  ngOnInit() {
    // 1. Obtener status de la BD al iniciar
    this.http.get('/api/tutorial-status').subscribe({
      next: (res: any) => {
        this.tutorialCounts = res;
        this.hasChecked = true;
        this.evaluateRoute(this.router.url);
      },
      error: (err) => console.error('Error fetching tutorial status', err)
    });

    // 2. Escuchar cambios de ruta
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (this.hasChecked) {
        this.evaluateRoute(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  evaluateRoute(url: string) {
    // Esconder siempre al cambiar de ruta antes de evaluar
    this.showBubble = false;
    this.showChat = false;

    // Determinar en qué módulo estamos basados en la URL
    if (url.includes('/dashboard/empleados')) {
      this.currentModule = 'empleados';
      if (this.tutorialCounts.empleados < 2) {
        this.triggerBubble('¡Hola! Estás en el módulo de Empleados. Veo que aún tienes pocos registros. ¡Haz clic en "Agregar Empleado" para registrar a tu equipo!');
      }
    } else if (url.includes('/dashboard/inventario')) {
      this.currentModule = 'inventario';
      if (this.tutorialCounts.inventario < 2) {
        this.triggerBubble('¡Hola! Bienvenido al Inventario. Aquí podrás registrar tus productos o servicios. ¡Comienza creando nuevos ítems!');
      }
    } else if (url.includes('/dashboard/clientes')) {
      this.currentModule = 'clientes';
      if (this.tutorialCounts.clientes < 2) {
        this.triggerBubble('¡Hola! En la sección de Clientes puedes registrar a tus compradores frecuentes. ¡Intenta agregar uno nuevo!');
      }
    } else if (url.includes('/dashboard/ventas')) {
      this.currentModule = 'ventas';
      if (this.tutorialCounts.ventas < 2) {
        this.triggerBubble('¡Hola! El módulo de Ventas te permite registrar cotizaciones y facturas. ¡Anímate a crear tu primera venta!');
      }
    } else {
      this.currentModule = 'general';
    }
  }

  triggerBubble(msg: string) {
    // Pequeño delay para que no aparezca bruscamente
    setTimeout(() => {
      this.bubbleMessage = msg;
      this.showBubble = true;
      // Auto-ocultar después de 15 segundos si el usuario no interactúa
      setTimeout(() => {
        this.showBubble = false;
      }, 15000);
    }, 1000);
  }

  toggleChat() {
    this.showChat = !this.showChat;
    if (this.showChat) {
      this.showBubble = false; // Ocultar burbuja si se abre el chat
    }
  }

  closeChat() {
    this.showChat = false;
  }
}
