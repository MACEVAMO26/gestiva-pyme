import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../../../shared/components/loading-spinner/loading-spinner';
import { FormsModule } from '@angular/forms';
import { forkJoin, timeout } from 'rxjs';
import { EstructuraService } from '../../../../../../services/estructura.service';
import { RolesService } from '../../../../../../services/roles.service';
import { ToastService } from '../../../../../../services/toast.service';

@Component({
  selector: 'app-admin-estructura',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './admin-estructura.html',
  styleUrl: './admin-estructura.scss'
})
export class AdminEstructura implements OnInit {
  private estructuraService = inject(EstructuraService);
  private rolesService = inject(RolesService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'sedes' | 'areas' | 'cargos' = 'sedes';
  
  sedes: any[] = [];
  areas: any[] = [];
  cargos: any[] = [];
  roles: any[] = [];

  isLoading = true;
  isSaving = false;

  // Modales
  isModalSedeOpen = false;
  isModalAreaOpen = false;
  isModalCargoOpen = false;
  editandoSedeId: number | null = null;

  // Formularios
  nuevaSede = { nombre: '', direccion: '', telefono: '', estado: 'activa' };
  nuevaArea = { nombre: '', descripcion: '' };
  nuevoCargo = { nombre: '', descripcion: '', funciones: '', rol_id: '' };

  ngOnInit() {
    this.cargarDatos();
  }

  setTab(tab: 'sedes' | 'areas' | 'cargos') {
    this.activeTab = tab;
  }

  cargarDatos() {
    this.isLoading = true;
    
    // Cargar todo en paralelo
    forkJoin({
      sedes: this.estructuraService.getSedes(),
      areas: this.estructuraService.getAreas(),
      cargos: this.estructuraService.getCargos(),
      roles: this.rolesService.getRoles()
    }).pipe(timeout(5000)).subscribe({
      next: (data) => {
        this.sedes = data.sedes;
        this.areas = data.areas;
        this.cargos = data.cargos;
        this.roles = data.roles;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('No se pudieron cargar los datos de la estructura');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoleName(rolId: number): string {
    const role = this.roles.find(r => r.id === rolId);
    return role ? role.nombre : 'Desconocido';
  }

  // --- MODALES ---
  cerrarModales() {
    this.isModalSedeOpen = false;
    this.isModalAreaOpen = false;
    this.isModalCargoOpen = false;
    this.editandoSedeId = null;
  }

  abrirModalSede() {
    this.nuevaSede = { nombre: '', direccion: '', telefono: '', estado: 'activa' };
    this.editandoSedeId = null;
    this.isModalSedeOpen = true;
  }

  abrirEdicionSede(sede: any) {
    this.nuevaSede = { ...sede };
    this.editandoSedeId = sede.id;
    this.isModalSedeOpen = true;
  }

  abrirModalArea() {
    this.nuevaArea = { nombre: '', descripcion: '' };
    this.isModalAreaOpen = true;
  }

  abrirModalCargo() {
    this.nuevoCargo = { nombre: '', descripcion: '', funciones: '', rol_id: '' };
    this.isModalCargoOpen = true;
  }

  // --- GUARDAR ---
  guardarSede() {
    if (!this.nuevaSede.nombre) {
      this.toast.warning('El nombre de la sede es obligatorio');
      return;
    }
    
    this.isSaving = true;
    if (this.editandoSedeId) {
      this.estructuraService.updateSede(this.editandoSedeId, this.nuevaSede).subscribe({
        next: (res) => {
          this.toast.success('Sede actualizada correctamente');
          this.isSaving = false;
          this.cerrarModales();
          this.cargarDatos();
        },
        error: (err) => {
          this.isSaving = false;
          this.toast.error(err.error?.message || 'Error al actualizar sede');
        }
      });
    } else {
      this.estructuraService.createSede(this.nuevaSede).subscribe({
        next: (res) => {
          this.toast.success('Sede creada exitosamente');
          this.isSaving = false;
          this.cerrarModales();
          this.cargarDatos();
        },
        error: (err) => {
          this.isSaving = false;
          this.toast.error(err.error?.message || 'Error al crear sede');
        }
      });
    }
  }

  guardarArea() {
    if (!this.nuevaArea.nombre) {
      this.toast.warning('El nombre del área es obligatorio');
      return;
    }

    this.isSaving = true;
    this.estructuraService.createArea(this.nuevaArea).subscribe({
      next: (res) => {
        this.toast.success('Área creada exitosamente');
        this.isSaving = false;
        this.cerrarModales();
        this.cargarDatos();
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.error(err.error?.message || 'Error al crear área');
      }
    });
  }

  guardarCargo() {
    if (!this.nuevoCargo.nombre || !this.nuevoCargo.rol_id) {
      this.toast.warning('El nombre y el rol son obligatorios');
      return;
    }

    this.isSaving = true;
    this.estructuraService.createCargo(this.nuevoCargo).subscribe({
      next: (res) => {
        this.toast.success('Cargo creado exitosamente');
        this.isSaving = false;
        this.cerrarModales();
        this.cargarDatos();
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.error(err.error?.message || 'Error al crear cargo');
      }
    });
  }

  // --- ESTADOS ---
  cambiarEstadoArea(area: any) {
    this.estructuraService.changeAreaStatus(area.id).subscribe({
      next: (res) => {
        area.activo = !area.activo;
        this.toast.success('Estado del área actualizado');
      },
      error: (err) => {
        this.toast.error('Error al cambiar el estado del área');
      }
    });
  }

  cambiarEstadoCargo(cargo: any) {
    if (cargo.nombre === 'Jefe de Recursos Humanos') {
      this.toast.warning('El Cargo de Recursos Humanos Base no se puede desactivar.');
      return;
    }

    this.estructuraService.changeCargoStatus(cargo.id).subscribe({
      next: (res) => {
        cargo.activo = !cargo.activo;
        this.toast.success('Estado del cargo actualizado');
      },
      error: (err) => {
        this.toast.error('Error al cambiar el estado del cargo');
      }
    });
  }
}
