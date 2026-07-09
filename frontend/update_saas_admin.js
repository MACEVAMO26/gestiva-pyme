const fs = require('fs');
const htmlPath = 'src/app/pages/saas-admin/saas-admin.component.html';
const tsPath = 'src/app/pages/saas-admin/saas-admin.component.ts';

// 1. Update HTML
let c = fs.readFileSync(htmlPath, 'utf8');
let lines = c.split(/\r?\n/);
let newLines = [
  ...lines.slice(0, 73),
  "      @if (currentView === 'dashboard') {",
  "        <app-dashboard-saas",
  '          [empresas]="empresas"',
  '          [empresasEnMora]="empresasEnMora"',
  '          [solicitudesPendientes]="solicitudesPendientes"',
  '          (changeView)="cambiarVista($event)">',
  "        </app-dashboard-saas>",
  "      }",
  ...lines.slice(159)
];
fs.writeFileSync(htmlPath, newLines.join('\n'));

// 2. Update TS
let ts = fs.readFileSync(tsPath, 'utf8');
ts = ts.replace(
  "import { CommonModule } from '@angular/common';",
  "import { CommonModule } from '@angular/common';\nimport { DashboardSaasComponent } from '../dashboard-saas/dashboard-saas.component';"
);
ts = ts.replace(
  "imports: [CommonModule, FormsModule],",
  "imports: [CommonModule, FormsModule, DashboardSaasComponent],"
);
fs.writeFileSync(tsPath, ts);
