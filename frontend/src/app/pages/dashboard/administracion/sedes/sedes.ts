import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sedes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sedes.html',
  styleUrl: './sedes.scss',
})
export class Sedes implements OnInit {
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  // --- VARIABLES DE ESTADO ---
  sedes: any[] = [];
  isLoading = true;
  showModal = false;
  isEditMode = false;
  isSubmitting = false;

  formData: any = {
    nombre: '',
    direccion: '',
    telefono: '',
    estado: 'activa'
  };

  // Inicializa cargando las sedes
  ngOnInit() {
    this.cargarSedes();
  }

  // Obtiene los headers requeridos para la API
  getHeaders() {
    return {
      'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
      'Accept': 'application/json'
    };
  }

  // Obtiene las sedes del sistema
  cargarSedes() {
    this.isLoading = true;
    this.http.get<any[]>('/api/sedes', { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.sedes = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando sedes', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Abre el modal para crear nueva sede
  abrirModalNuevo() {
    this.isEditMode = false;
    this.formData = {
      nombre: '',
      direccion: '',
      telefono: '',
      estado: 'activa'
    };
    this.showModal = true;
  }

  // Abre el modal en modo edicion
  abrirModalEditar(sede: any) {
    this.isEditMode = true;
    this.formData = { ...sede };
    this.showModal = true;
  }

  // Cierra el modal activo
  cerrarModal() {
    this.showModal = false;
  }

  // Guarda o actualiza la sede
  guardarSede() {
    if (!this.formData.nombre) return;
    this.isSubmitting = true;

    if (this.isEditMode) {
      this.http.put(`/api/sedes/${this.formData.id}`, this.formData, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.cargarSedes();
          this.cerrarModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert(err.error?.message || 'Error al actualizar sede');
        }
      });
    } else {
      this.http.post('/api/sedes', this.formData, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.cargarSedes();
          this.cerrarModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert(err.error?.message || 'Error al crear sede');
        }
      });
    }
  }

  // Alterna el estado activo/inactivo de una sede
  cambiarEstado(sede: any) {
    const nuevoEstado = sede.estado === 'activa' ? 'inactiva' : 'activa';
    this.http.put(`/api/sedes/${sede.id}`, { ...sede, estado: nuevoEstado }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        sede.estado = nuevoEstado;
      },
      error: (err) => {
        console.error('Error cambiando estado', err);
        alert(err.error?.message || 'Error al cambiar estado');
      }
    });
  }
}
