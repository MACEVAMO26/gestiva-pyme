import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
    { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'login/:empresa', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'demo-ventas', loadComponent: () => import('./pages/dashboard-demo/dashboard-demo').then(m => m.DashboardDemoComponent) },
    { path: 'demo-servicios', loadComponent: () => import('./pages/dashboard-demo/dashboard-demo').then(m => m.DashboardDemoComponent) },
    { path: 'demo-mixto', loadComponent: () => import('./pages/dashboard-demo/dashboard-demo').then(m => m.DashboardDemoComponent) },
    { path: 'saas-admin', redirectTo: 'saas-admin/dashboard', pathMatch: 'full' },
    { path: 'saas-admin/:vista', loadComponent: () => import('./pages/saas-admin/saas-admin.component').then(m => m.SaasAdminComponent), canActivate: [authGuard] },
    
    // Módulo Cliente Unificado (SPA Pura - Regla 11)
    { 
        path: ':entorno', 
        loadComponent: () => import('./pages/dashboard-cliente/dashboard-cliente.component').then(m => m.DashboardClienteComponent), 
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'inicio', pathMatch: 'full' },
            { path: ':modulo', loadComponent: () => import('./pages/shared/en-construccion/en-construccion').then(m => m.EnConstruccion) }
        ]
    },
    { path: '**', redirectTo: '' }
];
