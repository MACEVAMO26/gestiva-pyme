import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.scss'
})
export class PagosComponent implements OnInit {
  // --- VARIABLES DE ESTADO ---
  bancos = [
    'Bancolombia',
    'Nequi',
    'Daviplata',
    'Davivienda',
    'Banco de Bogotá',
    'Banco de Occidente',
    'BBVA',
    'Caja Social',
    'Otro'
  ];
  selectedBanco: string = '';
  selectedFile: File | null = null;
  isSubmitting = false;
  isRequestingMigration = false;
  solicitudes: any[] = [];
  ultimoPagoRechazado: any = null;

  http = inject(HttpClient);

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    const token = sessionStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    this.http.get<any[]>('/api/admin-requests', { headers })
      .subscribe({
        next: (data) => {
          this.solicitudes = data;
          this.ultimoPagoRechazado = data.find((s: any) => s.tipo === 'pago' && s.estado === 'rechazado' && s.notas_propietaria);
        },
        error: () => {}
      });
  }

  solicitarMigracion() {
    if (confirm('¿Estás seguro de que deseas solicitar la migración de tus datos y no continuar con el servicio?')) {
      this.isRequestingMigration = true;
      const token = sessionStorage.getItem('auth_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const body = { tipo: 'migracion' };
      this.http.post('/api/admin-requests', body, { headers })
        .subscribe({
          next: () => {
            alert('¡Solicitud de migración enviada a GestivaPyme!');
            this.isRequestingMigration = false;
            this.cargarSolicitudes();
          },
          error: (err) => {
            console.error(err);
            alert('Error al solicitar migración.');
            this.isRequestingMigration = false;
          }
        });
    }
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  submitPago() {
    if (!this.selectedBanco || !this.selectedFile) return;
    this.isSubmitting = true;

    const token = sessionStorage.getItem('auth_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const formData = new FormData();
    formData.append('tipo', 'pago');
    formData.append('banco', this.selectedBanco);
    if (this.selectedFile) {
      formData.append('comprobante', this.selectedFile);
    }

    this.http.post('/api/admin-requests', formData, { headers })
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('¡Comprobante enviado exitosamente! Gestión de pagos revisará el pago y activará tu sistema.');
          this.selectedBanco = '';
          this.selectedFile = null;
          this.cargarSolicitudes();
        },
        error: (err) => {
          console.error(err);
          alert('Error al enviar comprobante.');
          this.isSubmitting = false;
        }
      });
  }
}
