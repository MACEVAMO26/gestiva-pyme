import { Component } from '@angular/core';

@Component({
  selector: 'app-inicio-calendario',
  standalone: true,
  imports: [],
  templateUrl: './inicio-calendario.component.html',
  styleUrl: './inicio-calendario.component.scss'
})
export class InicioCalendarioComponent {
  // --- VARIABLES DE ESTADO ---
  isModalOpen = false;

  // Para abrir la ventana emergente de guardar un evento
  abrirModal() {
    this.isModalOpen = true;
  }

  // Para cerrar la ventana emergente
  cerrarModal() {
    this.isModalOpen = false;
  }

  // Para simular el guardado de datos y mostrar toast (Lógica a implementar futuro)
  guardarEvento() {
    // Aquí iría el guardado a base de datos
    this.cerrarModal();
  }
}
