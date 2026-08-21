const fs = require('fs');
let ts = fs.readFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', 'utf8');

let targetTs = `this.http.post(\`\${this.apiUrl}/empresas/\${empresaId}/reenviar-credenciales\`, {}).subscribe({
          next: (res: any) => {
            this.mostrarNotificacion('Credenciales reenviadas con éxito.', 'success');
          },
          error: (err) => {
            this.mostrarNotificacion('Error al reenviar credenciales.', 'error');
            console.error(err);
          }
        });`;
let replaceTs = `this.http.post(\`/api/saas/empresas/\${empresaId}/reenviar-credenciales\`, {}).subscribe({
          next: (res: any) => {
            if (this.toastService) {
              this.toastService.success(res.message || 'Credenciales reenviadas con éxito.');
            } else {
              alert('Credenciales reenviadas con éxito.');
            }
          },
          error: (err) => {
            if (this.toastService) {
              this.toastService.error('Error al reenviar credenciales.');
            } else {
              alert('Error al reenviar credenciales.');
            }
            console.error(err);
          }
        });`;

ts = ts.replace(targetTs, replaceTs);
fs.writeFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', ts);

let html = fs.readFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.html', 'utf8');
html = html.replace(/suscripcionEnEdicion\.descuentos/g, 'suscripcionEnEdicion!.descuentos');
fs.writeFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.html', html);
