import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaService } from '../../../../../../services/empresa.service';
import { AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-admin-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-empresa.html',
  styleUrl: './admin-empresa.scss',
})
export class AdminEmpresa implements OnInit {
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthService);

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
      this.empresaService.getEmpresa(currentUser.empresa_id).subscribe({
        next: (data) => {
          this.empresaData = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.mostrarToast('Error al cargar datos', 'error', 'No se pudo conectar con el servidor.');
          this.isLoading = false;
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
    
    this.empresaService.updateEmpresa(currentUser.empresa_id, this.empresaData).subscribe({
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
