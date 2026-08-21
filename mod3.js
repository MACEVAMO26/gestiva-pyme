const fs = require('fs');
let ts = fs.readFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', 'utf8');

ts = ts.replace("tipo_documento_gerente: 'CC'", "tipo_documento_gerente: 'CC',\n    documento_gerente: '',\n    tipo_empresa: 'Ventas'");

fs.writeFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.ts', ts);
