import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestiva-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss'
})
export class Onboarding {
  @Output() close = new EventEmitter<void>();
  
  // --- VARIABLES DE ESTADO ---
  step = 1;

  // Para ir al siguiente paso
  nextStep() {
    if (this.step < 3) {
      this.step++;
    } else {
      this.closeTutorial();
    }
  }

  // Para cerrar el tutorial
  closeTutorial() {
    this.close.emit();
  }
}
