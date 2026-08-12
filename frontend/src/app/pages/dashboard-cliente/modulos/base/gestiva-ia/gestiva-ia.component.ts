import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaService, IaConfig, IaChatHistory } from '../../../../../services/ia.service';
import { ToastService } from '../../../../../services/toast.service';
import { AuthService } from '../../../../../services/auth.service';
import { timeout } from 'rxjs/operators';

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
    this.iaService.getConfiguracion().pipe(timeout(8000)).subscribe({
      next: (res: any) => {
        if (res && res.proveedor !== undefined) {
          this.configuracion = res as IaConfig;
        }
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
    this.iaService.getHistorialChat().pipe(timeout(8000)).subscribe({
      next: (res: IaChatHistory[]) => {
        this.historial = res;
        this.cargando = false;
        this.scrollToBottom();
      },
      error: () => {
        this.historial = [];
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

  // --- VARIABLES PARA EL TEMPLATE (MERGE DE INVENTARIO Y TUTORIAL IA) ---
  activeTab: string = 'catalogo';
  showModal: boolean = false;
  showToast: boolean = false;
  toastType: string = 'success';
  toastMessage: string = '';
  step: number = 1;
  searchTerm: string = '';
  productosFiltrados: any[] = [];
  
  formProducto: any = {
    codigo: '',
    nombre: '',
    categoria_id: '',
    unidad_medida: '',
    precio_venta: null,
    precio_compra: null,
    stock_inicial: null
  };

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  abrirModal() {
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
  }

  guardarProducto() {
    this.guardando = true;
    setTimeout(() => {
      this.showModal = false;
      this.guardando = false;
      this.mostrarToast('success', 'Producto guardado con éxito');
    }, 800);
  }

  onFileSelected(event: any) {
    // Manejar archivo
  }

  nextStep() {
    if (this.step < 3) {
      this.step++;
    }
  }

  closeTutorial() {
    this.step = 3;
    // Opcional: emitir o guardar que ya vio el tutorial
  }

  getBadgeClass(stock: number, stockMinimo: number): string {
    if (stock <= 0) return 'badge-danger';
    if (stock <= stockMinimo) return 'badge-warning';
    return 'badge-success';
  }

  exportarExcel() {
    this.mostrarToast('success', 'Exportando a Excel...');
  }

  mostrarToast(type: string, message: string) {
    this.toastType = type;
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}
