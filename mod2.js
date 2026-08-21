const fs = require('fs');
let ts = fs.readFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', 'utf8');

let newFunc = `reenviarCredenciales(empresaId: number) {
    if (confirm('¿Estás seguro de que deseas reenviar las credenciales al gerente de esta empresa? Se generará una nueva contraseña temporal.')) {
      this.http.post(\`\${this.apiUrl}/empresas/\${empresaId}/reenviar-credenciales\`, {}).subscribe({
        next: (res: any) => {
          this.mostrarNotificacion('Credenciales reenviadas con éxito.', 'success');
        },
        error: (err) => {
          this.mostrarNotificacion('Error al reenviar credenciales.', 'error');
          console.error(err);
        }
      });
    }
  }

  cambiarEstadoEmpresa`;

ts = ts.replace('cambiarEstadoEmpresa', newFunc);
fs.writeFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', ts);
