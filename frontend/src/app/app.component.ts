import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html', // <-- Asegúrate de que apunta al .component.html
  styleUrl: './app.component.scss'    // <-- Y al .component.scss
})
export class AppComponent {
  title = 'frontend';
}