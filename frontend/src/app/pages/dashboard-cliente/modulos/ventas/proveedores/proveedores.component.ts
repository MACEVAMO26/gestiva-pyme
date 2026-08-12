import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProveedorService, Proveedor } from '../../../../../services/proveedor.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss'
})
export class ProveedoresComponent implements OnInit {
  private proveedorService = inject(ProveedorService);
  private toast = inject(ToastService);

  proveedores: Proveedor[] = [];
  cargando = false;
  guardando = false;

  nuevoProveedor: Proveedor = {
    razon_social: '',
    nit: '',
    contacto: '',
    telefono: '',
    direccion: '',
    email: '',
    documentos_url: '',
    activo: true,
    calificacion: 0,
    comentarios_evaluacion: '',
    estado_evaluacion: 'Pendiente'
  };

  ngOnInit() {
    this.cargarProveedores();
  }

  cargarProveedores() {
    this.cargando = true;
    this.proveedorService.getProveedores().subscribe({
      next: (res) => {
        this.proveedores = res;
        this.cargando = false;
      },
      error: () => {
        this.toast.error('Error al cargar proveedores');
        this.cargando = false;
      }
    });
  }

  guardarProveedor() {
    if (!this.nuevoProveedor.razon_social || !this.nuevoProveedor.nit) {
      this.toast.warning('Razón social y NIT son obligatorios');
      return;
    }
    
    this.guardando = true;
    this.proveedorService.crearProveedor(this.nuevoProveedor).subscribe({
      next: () => {
        this.toast.success('Proveedor registrado');
        this.cargarProveedores();
        this.nuevoProveedor = {
          razon_social: '', nit: '', contacto: '', telefono: '', direccion: '', 
          email: '', documentos_url: '', activo: true, calificacion: 0, 
          comentarios_evaluacion: '', estado_evaluacion: 'Pendiente'
        };
        this.guardando = false;
      },
      error: () => {
        this.toast.error('Error al registrar proveedor');
        this.guardando = false;
      }
    });
  }
}
