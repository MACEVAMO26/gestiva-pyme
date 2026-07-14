import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  // --- VARIABLES DE ESTADO ---
  isChatbotOpen = false;
  botView: 'menu' | 'phone' | 'form' | 'success' = 'menu';
  isSubmitting = false;
  errorMessage = '';
  leadForm = {
    nombre: '',
    telefono: '',
    correo: '',
    horario_llamada: '',
    mensaje: ''
  };

  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
    if (!this.isChatbotOpen) {
      this.botView = 'menu';
      this.errorMessage = '';
    }
  }

  showPhone() {
    this.botView = 'phone';
  }

  showForm() {
    this.botView = 'form';
  }

  backToMenu() {
    this.botView = 'menu';
    this.errorMessage = '';
  }

  submitLead() {
    this.errorMessage = '';
    if (!this.leadForm.nombre || !this.leadForm.telefono || !this.leadForm.correo || !this.leadForm.horario_llamada) {
      this.errorMessage = 'Por favor completa nombre, teléfono, correo y horario.';
      return;
    }

    this.isSubmitting = true;

    this.http.post('https://gestiva-pyme.onrender.com/api/leads', this.leadForm)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.botView = 'success';
          
          // Restablece el formulario a sus valores iniciales
          this.leadForm = {
            nombre: '',
            telefono: '',
            correo: '',
            horario_llamada: '',
            mensaje: ''
          };
          this.cdr.detectChanges();

          // Cierra automáticamente el mensaje de éxito después de 3 segundos
          setTimeout(() => {
            if (this.botView === 'success') {
              this.backToMenu();
              this.cdr.detectChanges();
            }
          }, 3000);
        },
        error: (err) => {
          console.error('Error enviando lead:', err);
          this.errorMessage = 'Hubo un error de conexión con el servidor. Intenta nuevamente.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
  }
}
