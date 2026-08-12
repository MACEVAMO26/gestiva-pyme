import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './administracion.html',
  styleUrl: './administracion.scss'
})
export class AdministracionComponent {
}
