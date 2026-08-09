import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestiva-ai-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  // --- VARIABLES DE ESTADO ---
  // Simulación de métricas para darle vida a la IA
  recomendacionMensaje = "He notado un aumento del 15% en los registros de clientes esta semana. Te sugiero revisar el módulo de inventario para asegurar que tienes suficiente stock para cubrir posibles ventas.";
  
  configuracionScore = 80; // Simulado
}
