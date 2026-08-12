import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-crm-gestion-de-clientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './crm-gestion-de-clientes.component.html',
  styleUrl: './crm-gestion-de-clientes.component.scss'
})
export class CrmGestionDeClientesComponent {
  // Aquí se expandirá la vista 360 del cliente
}
