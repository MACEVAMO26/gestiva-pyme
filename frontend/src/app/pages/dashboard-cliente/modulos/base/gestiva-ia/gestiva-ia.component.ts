import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaService, IaConfig, IaChatHistory } from '../../../../../services/ia.service';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-gestiva-ia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestiva-ia.component.html',
  styleUrl: './gestiva-ia.component.scss'
})
export class GestivaIaComponent implements OnInit, AfterViewChecked {
  private iaService = inject(IaService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  pestanaActual = 'chat'; // 'chat' | 'config'
  cargando = false;
  guardando = false;

  // Configuración
  configuracion: IaConfig = {
    proveedor: 'openai',
    api_key: '',
    is_active: false
  };

  // Chat
  historial: IaChatHistory[] = [];
  nuevoMensaje = '';
  modoActual = 'general';
  
  esGerente = false;

  ngOnInit() {
    this.esGerente = this.authService.getUser()?.rol?.nombre === 'Gerente';
    this.cargarConfiguracion();
    this.cargarHistorial();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  cambiarPestana(pestana: string) {
    this.pestanaActual = pestana;
  }

  // --- CONFIGURACIÓN ---
  cargarConfiguracion() {
    if (!this.esGerente) return;
    this.iaService.getConfiguracion().subscribe({
      next: (res) => {
        if (res) this.configuracion = res;
      },
      error: () => {
        // Fallo silencioso si no hay configuración previa
      }
    });
  }

  guardarConfiguracion() {
    this.guardando = true;
    this.iaService.guardarConfiguracion(this.configuracion).subscribe({
      next: () => {
        this.toast.success('Configuración de IA guardada');
        this.guardando = false;
      },
      error: () => {
        this.toast.error('Error al guardar configuración');
        this.guardando = false;
      }
    });
  }

  // --- CHAT ---
  cargarHistorial() {
    this.cargando = true;
    this.iaService.getHistorialChat().subscribe({
      next: (res) => {
        this.historial = res;
        this.cargando = false;
        this.scrollToBottom();
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    // Agregar mensaje localmente para sensación de rapidez
    const userMsg: IaChatHistory = { rol: 'user', mensaje: this.nuevoMensaje, modo: this.modoActual };
    this.historial.push(userMsg);
    
    const textoAEnviar = this.nuevoMensaje;
    this.nuevoMensaje = '';
    this.guardando = true;

    this.iaService.enviarMensaje(textoAEnviar, this.modoActual).subscribe({
      next: (res) => {
        // Asumiendo que res.mensaje o res.respuesta contiene el objeto de respuesta
        const botMsg: IaChatHistory = { rol: 'assistant', mensaje: res.respuesta || '...', modo: this.modoActual };
        this.historial.push(botMsg);
        this.guardando = false;
        this.scrollToBottom();
      },
      error: () => {
        this.toast.error('Error al procesar la respuesta de la IA');
        this.guardando = false;
      }
    });
  }

  limpiarChat() {
    if (confirm('¿Limpiar todo el historial de chat?')) {
      this.iaService.limpiarHistorial().subscribe({
        next: () => {
          this.historial = [];
          this.toast.success('Chat limpiado');
        },
        error: () => this.toast.error('Error al limpiar el chat')
      });
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
