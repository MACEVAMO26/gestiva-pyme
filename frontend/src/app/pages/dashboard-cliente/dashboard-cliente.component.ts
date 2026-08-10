import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-cliente.component.html',
  styleUrl: './dashboard-cliente.component.scss'
})
export class DashboardClienteComponent implements OnInit {
  // --- VARIABLES DE ESTADO ---
  
  // Módulo actualmente visible en el centro de la pantalla
  currentModule: string = 'home';
  
  // Simulación de los módulos que la empresa ha pagado/contratado
  // Cuando se conecte el backend, esto lo llenará el ModulosService
  modulosActivos: Record<string, boolean> = {};

  // Estado visual del menú lateral (colapsado o expandido)
  isSidebarCollapsed = false;

  constructor() {}

  ngOnInit(): void {
    // Inicialización del componente
  }

  // Cambia la vista central al submódulo seleccionado
  switchModule(moduleName: string): void {
    this.currentModule = moduleName;
  }
  
  // Alterna el estado del menú lateral
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
