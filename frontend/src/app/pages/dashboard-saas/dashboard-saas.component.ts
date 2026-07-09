import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-saas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-saas.component.html',
  styleUrls: ['./dashboard-saas.component.scss']
})
export class DashboardSaasComponent {
  @Input() empresas: any[] = [];
  @Input() empresasEnMora: number = 0;
  @Input() solicitudesPendientes: number = 0;

  @Output() changeView = new EventEmitter<string>();

  cambiarVista(vista: string) {
    this.changeView.emit(vista);
  }
}
