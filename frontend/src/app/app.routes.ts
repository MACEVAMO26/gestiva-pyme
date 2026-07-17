import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
    { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'login/:empresa', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard-main/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
    { path: 'demo-ventas', loadComponent: () => import('./pages/dashboard-demo/dashboard-demo').then(m => m.DashboardDemoComponent), canActivate: [authGuard] },
    { path: 'demo-servicios', loadComponent: () => import('./pages/dashboard-demo/dashboard-demo').then(m => m.DashboardDemoComponent), canActivate: [authGuard] },
    { path: 'demo-mixto', loadComponent: () => import('./pages/dashboard-demo/dashboard-demo').then(m => m.DashboardDemoComponent), canActivate: [authGuard] },
    { path: 'saas-admin', loadComponent: () => import('./pages/saas-admin/saas-admin.component').then(m => m.SaasAdminComponent), canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
