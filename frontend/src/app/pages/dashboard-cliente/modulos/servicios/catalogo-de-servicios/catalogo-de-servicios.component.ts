import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogoServiciosService, Servicio } from '../../../../../services/catalogo-servicios.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-catalogo-de-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo-de-servicios.component.html',
  styleUrl: './catalogo-de-servicios.component.scss'
})
export class CatalogoDeServiciosComponent implements OnInit {
  private catalogoService = inject(CatalogoServiciosService);
  private toast = inject(ToastService);

  servicios: Servicio[] = [];
  cargando = false;
  guardando = false;

  nuevoServicio: Servicio = {
    nombre: '',
    descripcion: '',
    tarifa: 0,
    tiempo_estimado: ''
  };

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios() {
    this.cargando = true;
    this.catalogoService.getServicios().subscribe({
      next: (res) => {
        this.servicios = res;
        this.cargando = false;
      },
      error: () => {
        this.toast.error('Error al cargar catálogo de servicios');
        this.cargando = false;
      }
    });
  }

  guardarServicio() {
    if (!this.nuevoServicio.nombre) {
      return this.toast.warning('El nombre del servicio es obligatorio');
    }

    this.guardando = true;
    this.catalogoService.crearServicio(this.nuevoServicio).subscribe({
      next: () => {
        this.toast.success('Servicio guardado con éxito');
        this.nuevoServicio = { nombre: '', descripcion: '', tarifa: 0, tiempo_estimado: '' };
        this.cargarServicios();
        this.guardando = false;
      },
      error: () => {
        this.toast.error('Error al guardar el servicio');
        this.guardando = false;
      }
    });
  }
}
