import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { LandingComponent } from './pages/landing/landing.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SaasAdminComponent } from './pages/saas-admin/saas-admin.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', component: LandingComponent },                            // Raíz: Muestra la Landing Page
    { path: 'login', component: LoginComponent },                         // Ruta del login
    { path: 'login/:empresa', component: LoginComponent },                // Ruta dinámica Marca Blanca
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },                 // Panel principal (Después del login)
    { path: 'saas-admin', component: SaasAdminComponent, canActivate: [authGuard] },                // Panel maestro para el SaaS
    { path: '**', redirectTo: '' }                                        // Ruta de regreso a la Landing
];