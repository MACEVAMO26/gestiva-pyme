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
  
  step = 1;

  nextStep() {
    if (this.step < 3) {
      this.step++;
    } else {
      this.closeTutorial();
    }
  }

  closeTutorial() {
    this.close.emit();
  }
}
