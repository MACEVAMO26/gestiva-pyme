const fs = require('fs');
let html = fs.readFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.html', 'utf8');
let t_nit = `<div class="saas-form-group">
            <label class="saas-label">NIT</label>
            <input
              type="text"
              [(ngModel)]="nuevaEmpresa.nit"
              name="nit"
              required
              class="saas-input"
            />
          </div>`;
let r_nit = `<div class="grid grid-cols-2 gap-4">
          <div class="saas-form-group">
            <label class="saas-label">NIT</label>
            <input
              type="text"
              [(ngModel)]="nuevaEmpresa.nit"
              name="nit"
              required
              class="saas-input"
            />
          </div>
          <div class="saas-form-group">
            <label class="saas-label">Tipo de Paquete Base</label>
            <select [(ngModel)]="nuevaEmpresa.tipo_empresa" name="tipo_empresa" class="saas-select" required>
              <option value="Ventas">Ventas</option>
              <option value="Servicios">Servicios</option>
              <option value="Mixto">Mixto (Ventas y Servicios)</option>
            </select>
          </div>
        </div>`;
html = html.replace(t_nit, r_nit);

let t_doc = `<select
                [(ngModel)]="nuevaEmpresa.tipo_documento_gerente"
                name="tipo_documento_gerente"
                class="saas-select"
                required
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="PEP">Permiso Especial de Permanencia (PEP)</option>
                <option value="PPT">Permiso de Protección Temporal (PPT)</option>
              </select>
            </div>`;
let r_doc = `<select
                [(ngModel)]="nuevaEmpresa.tipo_documento_gerente"
                name="tipo_documento_gerente"
                class="saas-select"
                required
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="PEP">Permiso Especial de Permanencia (PEP)</option>
                <option value="PPT">Permiso de Protección Temporal (PPT)</option>
              </select>
            </div>
            <div class="saas-form-group">
              <label class="saas-label">Número de Identificación</label>
              <input type="text" [(ngModel)]="nuevaEmpresa.documento_gerente" name="documento_gerente" class="saas-input" placeholder="Ej: 123456789" />
            </div>`;
html = html.replace(t_doc, r_doc);

html = html.replace(/w-10 h-10/g, 'w-8 h-8').replace(/w-5 h-5/g, 'w-4 h-4');

let t_btn = `<!-- Activar (Check) -->`;
let r_btn = `<!-- Reenviar Credenciales -->
                            <button
                              (click)="reenviarCredenciales(empresa.id)"
                              class="w-8 h-8 rounded-full glass-btn-gray flex items-center justify-center transition-colors hover:border-blue-500/30"
                              title="Reenviar Credenciales"
                            >
                              <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-blue-400">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.909A2.25 2.25 0 0 1 2.25 6.993V6.75m19.5 0v.243m0 0a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.909A2.25 2.25 0 0 1 2.25 6.993V6.75" />
                              </svg>
                            </button>

                            <!-- Activar (Check) -->`;
html = html.replace(t_btn, r_btn);

fs.writeFileSync('frontend/src/app/pages/saas-admin/saas-admin.component.html', html);
