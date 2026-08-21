const fs = require('fs');
let html = fs.readFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.html', 'utf8');

html = html.replace('<option value="Mixto">Mixto (Ventas y Servicios)</option>', '<option value="Ventas y Servicios">Mixto (Ventas y Servicios)</option>');

fs.writeFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.html', html);
