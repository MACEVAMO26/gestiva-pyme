import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [],
  templateUrl: './admin-roles.html',
  styleUrl: './admin-roles.scss'
})
export class AdminRoles {
  isModalOpen = false;
  abrirModal() { this.isModalOpen = true; }
  cerrarModal() { this.isModalOpen = false; }
  guardar() { this.cerrarModal(); }
}
