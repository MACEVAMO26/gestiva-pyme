import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio-calendario.component.html',
  styleUrl: './inicio-calendario.component.scss'
})
export class InicioCalendarioComponent implements OnInit {
  // --- VARIABLES DE ESTADO ---
  isModalOpen = false;
  mesActual = new Date();
  diasDelMes: {dia: number, hoy: boolean, evento: boolean}[] = [];
  diasVacios: number[] = [];
  nombreMes = '';

  diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  ngOnInit() {
    this.generarCalendario();
  }

  // Genera la grilla de días del mes actual
  generarCalendario() {
    const anio = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.nombreMes = `${meses[mes]} ${anio}`;

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const totalDias = ultimoDia.getDate();

    // Lunes = 0, Domingo = 6 (ajuste para semana empezando en Lunes)
    let diaInicio = primerDia.getDay() - 1;
    if (diaInicio < 0) diaInicio = 6;

    this.diasVacios = Array(diaInicio).fill(0);

    const hoy = new Date();
    this.diasDelMes = [];
    for (let d = 1; d <= totalDias; d++) {
      this.diasDelMes.push({
        dia: d,
        hoy: (d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()),
        evento: false
      });
    }
  }

  // Navegar al mes anterior
  mesAnterior() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.generarCalendario();
  }

  // Navegar al mes siguiente
  mesSiguiente() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
    this.generarCalendario();
  }

  abrirModal() {
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
  }

  guardarEvento() {
    this.cerrarModal();
  }
}
