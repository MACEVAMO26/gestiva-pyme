import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { ToastService } from '../../../../../services/toast.service';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.scss'
})
export class AdministracionComponent implements OnInit, AfterViewInit {
  @ViewChild('firmaCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;

  isLoading = true;
  isSubmitting = false;
  contratoActivo: any = null;
  userEmpresa: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    const esGerente = user?.rol?.nombre === 'Gerente General' || user?.rol?.nombre === 'Gerente';
    if (!esGerente) {
      this.toastService.error('Acceso denegado. Solo el Gerente puede administrar el contrato.');
      this.router.navigate(['/dashboard/inicio']);
      return;
    }

    if (user && user.empresa) {
      this.userEmpresa = user.empresa;
    }
    this.cargarContratoActivo();
  }

  ngAfterViewInit(): void {
    if (this.canvasRef) {
      this.initCanvas();
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#0f172a'; // Tono oscuro

    // Eventos Mouse
    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

    // Eventos Touch
    canvas.addEventListener('touchstart', this.startDrawingTouch.bind(this));
    canvas.addEventListener('touchmove', this.drawTouch.bind(this));
    canvas.addEventListener('touchend', this.stopDrawing.bind(this));
  }

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
        'Accept': 'application/json'
      })
    };
  }

  cargarContratoActivo() {
    this.isLoading = true;
    this.http.get('/api/saas/contratos/activo', this.getHeaders()).subscribe({
      next: (res: any) => {
        this.contratoActivo = res;
        this.isLoading = false;
        
        // El canvas solo se inicializa si el contrato no ha sido firmado
        setTimeout(() => {
          if (this.canvasRef && this.userEmpresa?.contrato_id !== this.contratoActivo.id) {
            this.initCanvas();
          }
        }, 100);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        if (err.status !== 404) {
          this.toastService.error('No se pudo cargar el contrato.');
        }
      }
    });
  }

  // Métodos de dibujo en Canvas
  private startDrawing(e: MouseEvent) {
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(e.offsetX, e.offsetY);
  }

  private draw(e: MouseEvent) {
    if (!this.isDrawing) return;
    this.ctx.lineTo(e.offsetX, e.offsetY);
    this.ctx.stroke();
  }

  private startDrawingTouch(e: TouchEvent) {
    e.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const touch = e.touches[0];
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
  }

  private drawTouch(e: TouchEvent) {
    if (!this.isDrawing) return;
    e.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const touch = e.touches[0];
    this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    this.ctx.stroke();
  }

  private stopDrawing() {
    this.isDrawing = false;
    this.ctx.closePath();
  }

  limpiarFirma() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  firmarContrato() {
    if (!this.contratoActivo) return;

    const canvas = this.canvasRef.nativeElement;
    // Verificar si el canvas está en blanco (de forma rudimentaria chequeando datos de pixeles)
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      this.toastService.warning('Debe dibujar su firma antes de aceptar.');
      return;
    }

    const firmaBase64 = canvas.toDataURL('image/png');
    this.isSubmitting = true;

    const payload = {
      contrato_id: this.contratoActivo.id,
      firma_base64: firmaBase64
    };

    this.http.post('/api/saas/contratos/firmar', payload, this.getHeaders()).subscribe({
      next: (res: any) => {
        this.toastService.success(res.message || 'Contrato firmado con éxito.');
        // Actualizar datos del usuario/empresa localmente
        this.userEmpresa.contrato_id = this.contratoActivo.id;
        this.userEmpresa.fecha_firma = res.fecha_firma;
        this.userEmpresa.firma_gerente_url = firmaBase64;
        
        const currentUser = this.authService.getUser();
        if (currentUser) {
          currentUser.empresa = this.userEmpresa;
          sessionStorage.setItem('current_user', JSON.stringify(currentUser));
        }

        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.error(err.error?.message || 'Error al firmar el contrato.');
        this.isSubmitting = false;
      }
    });
  }

  descargarCopiaContrato() {
    this.toastService.info('Generando copia PDF de su contrato firmado...');
    this.http.get(`/api/empresas/${this.userEmpresa.id}/descargar-contrato`, {
      ...this.getHeaders(),
      responseType: 'blob' as 'json'
    }).subscribe({
      next: (data: any) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Contrato_Servicios_GestivaPyme_${this.userEmpresa.razon_social || this.userEmpresa.nombre_comercial}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastService.error('Hubo un error al generar el PDF del contrato.');
      }
    });
  }
}
