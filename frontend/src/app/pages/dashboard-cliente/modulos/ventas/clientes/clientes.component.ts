import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Cliente } from '../../../../../services/cliente.service';
import { ToastService } from '../../../../../services/toast.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private toast = inject(ToastService);

  clientes: Cliente[] = [];
  cargando = false;
  guardando = false;

  nuevoCliente: Cliente = {
    nombres: '',
    apellidos: '',
    nombre_razon_social: '',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    tipo_cliente: 'natural',
    comentarios: '',
    activo: true
  };

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.cargando = true;
    this.clienteService.getClientes().subscribe({
      next: (res) => {
        this.clientes = res;
        this.cargando = false;
      },
      error: () => {
        this.toast.error('Error al cargar clientes');
        this.cargando = false;
      }
    });
  }

  guardarCliente() {
    if (!this.nuevoCliente.nombres || !this.nuevoCliente.documento) {
      this.toast.warning('Nombres y documento son obligatorios');
      return;
    }
    
    this.guardando = true;
    this.clienteService.crearCliente(this.nuevoCliente).subscribe({
      next: () => {
        this.toast.success('Cliente registrado correctamente');
        this.cargarClientes();
        this.nuevoCliente = { 
          nombres: '', apellidos: '', nombre_razon_social: '', documento: '', 
          email: '', telefono: '', direccion: '', ciudad: '', tipo_cliente: 'natural', 
          comentarios: '', activo: true 
        };
        this.guardando = false;
      },
      error: () => {
        this.toast.error('Error al registrar cliente');
        this.guardando = false;
      }
    });
  }
}
