const fs = require('fs');
let html = fs.readFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.html', 'utf8');

html = html.replace(/suscripcionEnEdicion\.descuentos !== 'Ninguno'/g, "suscripcionEnEdicion!.descuentos !== 'Ninguno'");
html = html.replace(/\{\{ suscripcionEnEdicion\.descuentos \}\}/g, "{{ suscripcionEnEdicion!.descuentos }}");
html = html.replace(/suscripcionEnEdicion\.descuentos === 'Ninguno'/g, "suscripcionEnEdicion!.descuentos === 'Ninguno'");

fs.writeFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.html', html);
