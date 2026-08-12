import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner';
import { FormsModule } from '@angular/forms';
import { timeout } from 'rxjs';
import { EmpresaService } from '../../../../../../services/empresa.service';
import { AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-admin-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './admin-empresa.html',
  styleUrl: './admin-empresa.scss',
})
export class AdminEmpresa implements OnInit {
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  empresaData: any = {
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email_contacto: '',
    color_primario: '#45a1ae',
    logo_url: ''
  };

  isLoading = true;
  isSaving = false;
  
  toasts: any[] = [];

  ngOnInit(): void {
    this.cargarEmpresa();
  }

  cargarEmpresa() {
    this.isLoading = true;
    const currentUser = this.authService.getUser();
    if (currentUser && currentUser.empresa_id) {
      this.empresaService.getEmpresa(currentUser.empresa_id).pipe(timeout(5000)).subscribe({
        next: (data) => {
          // Aseguramos que data sea un objeto válido
          this.empresaData = data || {};
          
          // Mapeos de base de datos a frontend para que no falten propiedades
          this.empresaData.nombre = data?.razon_social || '';
          this.empresaData.nit = data?.nit || '';
          this.empresaData.direccion = data?.direccion || '';
          this.empresaData.telefono = data?.telefono || '';
          
          this.isLoading = false;
          this.cdr.detectChanges(); // Forzar actualización de la vista
        },
        error: (err) => {
          console.error('[AdminEmpresa] Error al cargar empresa:', err);
          this.mostrarToast('Error al cargar datos', 'error', 'No se pudo conectar con el servidor.');
          this.isLoading = false;
          this.cdr.detectChanges(); // Forzar actualización de la vista
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  guardarCambios() {
    if (!this.empresaData.nombre || !this.empresaData.nit) {
      this.mostrarToast('Campos Incompletos', 'warning', 'Por favor llena los campos obligatorios.');
      return;
    }

    this.isSaving = true;
    const currentUser = this.authService.getUser();
    
    const payload = {
      ...this.empresaData,
      razon_social: this.empresaData.nombre,
      tipo_empresa: this.empresaData.tipo_empresa || 'Servicios' // Fallback si no está
    };
    
    this.empresaService.updateEmpresa(currentUser.empresa_id, payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.mostrarToast('Actualizado', 'success', 'Los datos de la empresa se guardaron correctamente.');
      },
      error: (err) => {
        this.isSaving = false;
        this.mostrarToast('Error', 'error', 'Hubo un problema al guardar los cambios.');
      }
    });
  }

  // --- Sistema Neumórfico de Toasts ---
  mostrarToast(titulo: string, tipo: 'success'|'error'|'warning'|'info', descripcion?: string) {
    const nuevoToast = { id: Date.now(), titulo, tipo, descripcion };
    this.toasts.unshift(nuevoToast); // Agregar al inicio de la pila

    // Desaparecer automáticamente después de 4 segundos
    setTimeout(() => {
      this.cerrarToast(nuevoToast.id);
    }, 4000);
  }

  cerrarToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
