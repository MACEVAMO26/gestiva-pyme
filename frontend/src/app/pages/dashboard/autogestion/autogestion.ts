import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-autogestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autogestion.html',
  styleUrl: './autogestion.scss'
})
export class AutogestionComponent implements OnInit {
  // --- VARIABLES DE ESTADO ---
  user: any = null;
  afiliacion: any = null;
  formAfiliacion = {
    eps: '',
    arl: '',
    afondo_pension: '',
    fecha_contratacion: '',
    finalizacion_contrato: '',
    renovacion_contrato: '',
    estado: 'pendiente'
  };

  private authService = inject(AuthService);
  private http = inject(HttpClient);

  get isAdmin(): boolean {
    const rol = this.user?.rol?.nombre?.toLowerCase() || '';
    return rol.includes('gerente') || rol.includes('recursos humanos') || rol.includes('administrador');
  }

  ngOnInit(): void {
    this.user = this.authService.getUser() as any;
    this.cargarAfiliaciones();
  }

  cargarAfiliaciones() {
    this.http.get('https://gestiva-pyme.onrender.com/api/autogestion/afiliaciones').subscribe({
      next: (res: any) => {
        if (res.afiliacion) {
          this.afiliacion = res.afiliacion;
          this.formAfiliacion = {
            eps: res.afiliacion.eps || '',
            arl: res.afiliacion.arl || '',
            afondo_pension: res.afiliacion.afondo_pension || '',
            fecha_contratacion: res.afiliacion.fecha_contratacion || '',
            finalizacion_contrato: res.afiliacion.finalizacion_contrato || '',
            renovacion_contrato: res.afiliacion.renovacion_contrato || '',
            estado: res.afiliacion.estado || 'pendiente'
          };
        }
      },
      error: (err) => console.error(err)
    });
  }

  guardarAfiliaciones() {
    this.http.post('https://gestiva-pyme.onrender.com/api/autogestion/afiliaciones', this.formAfiliacion).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.cargarAfiliaciones();
      },
      error: (err) => console.error(err)
    });
  }

  // Gestiona las fechas de afiliación por parte del administrador
  gestionarAfiliacionAdmin() {
    if(!this.user) return;
    this.http.post(`https://gestiva-pyme.onrender.com/api/autogestion/empleado/${this.user.id}/afiliaciones`, this.formAfiliacion).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.cargarAfiliaciones();
      },
      error: (err) => console.error(err)
    });
  }
}
