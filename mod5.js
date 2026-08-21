const fs = require('fs');
let ts = fs.readFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', 'utf8');

let target = `tipo_documento_gerente: empresa.tipo_documento_gerente || 'CC'
      };`;
let replace = `tipo_documento_gerente: empresa.tipo_documento_gerente || 'CC',
        documento_gerente: empresa.gerente?.documento || '',
        tipo_empresa: empresa.tipo_empresa || 'Ventas'
      };`;

ts = ts.replace(target, replace);
fs.writeFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', ts);
