import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { LandingComponent } from './pages/landing/landing.component';
import { DashboardComponent } from './pages/dashboard/dashboard-main/dashboard.component';
import { DashboardDemoComponent } from './pages/dashboard-demo/dashboard-demo';
import { SaasAdminComponent } from './pages/saas-admin/saas-admin.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'login', component: LoginComponent },
    { path: 'login/:empresa', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'demo-ventas', component: DashboardDemoComponent, canActivate: [authGuard] },
    { path: 'demo-servicios', component: DashboardDemoComponent, canActivate: [authGuard] },
    { path: 'demo-mixto', component: DashboardDemoComponent, canActivate: [authGuard] },
    { path: 'saas-admin', component: SaasAdminComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];