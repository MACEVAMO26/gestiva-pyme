import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../../services/empleado.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.scss',
})
export class EmpleadosComponent implements OnInit {

  empleadoService = inject(EmpleadoService);
  cdr = inject(ChangeDetectorRef);

  empleados: any[] = [];
  cargos: any[] = [];
  roles: any[] = [];

  // Modal State
  isModalOpen = false;
  isEditMode = false;
  currentEmpleado: any = {
    nombres: '',
    apellidos: '',
    documento: '',
    email: '',
    cargo_id: '',
    rol_id: ''
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.empleadoService.getEmpleados().subscribe({
      next: (data: any) => {
        console.log('Empleados recibidos:', data);
        this.empleados = data;
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (err) => console.error('Error cargando empleados:', err)
    });
    
    this.empleadoService.getCargos().subscribe({
      next: (data: any) => {
        this.cargos = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando cargos:', err)
    });

    this.empleadoService.getRoles().subscribe({
      next: (data: any) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando roles:', err)
    });
  }

  openModal(empleado?: any) {
    if (empleado) {
      this.isEditMode = true;
      this.currentEmpleado = { ...empleado };
    } else {
      this.isEditMode = false;
      this.currentEmpleado = {
        nombres: '',
        apellidos: '',
        documento: '',
        email: '',
        cargo_id: '',
        rol_id: ''
      };
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveEmpleado() {
    if (this.isEditMode) {
      this.empleadoService.updateEmpleado(this.currentEmpleado.id, this.currentEmpleado).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => alert('Error al actualizar empleado: ' + (err.error?.message || 'Error desconocido'))
      });
    } else {
      this.empleadoService.createEmpleado(this.currentEmpleado).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => alert('Error al crear empleado: ' + (err.error?.message || 'Error desconocido'))
      });
    }
  }

  toggleStatus(id: number) {
    if(confirm('¿Estás seguro de cambiar el estado de este empleado?')) {
      this.empleadoService.toggleStatus(id).subscribe({
        next: () => this.loadData(),
        error: (err: any) => alert('Error al cambiar el estado')
      });
    }
  }
}

