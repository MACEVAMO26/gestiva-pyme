const fs = require('fs');
let ts = fs.readFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', 'utf8');

const regex = /reenviarCredenciales\(empresaId: number\) \{[\s\S]*?\}\s*\}/;

const newMethod = `reenviarCredenciales(empresaId: number) {
    if (confirm('¿Estás seguro de que deseas reenviar las credenciales al gerente de esta empresa? Se generará una nueva contraseña temporal.')) {
      this.http.post(\`/api/saas/empresas/\${empresaId}/reenviar-credenciales\`, {}).subscribe({
        next: (res: any) => this.toastService.success('Credenciales reenviadas con éxito.'),
        error: (err) => this.toastService.error('Error al reenviar credenciales.')
      });
    }
  }`;

ts = ts.replace(regex, newMethod);
fs.writeFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', ts);
