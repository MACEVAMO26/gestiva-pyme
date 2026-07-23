import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent) },
    { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'login/:empresa', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
    { path: 'demo-ventas', loadComponent: () => import('./pages/dashboard-demo/dashboard-demo').then(m => m.DashboardDemoComponent), canActivate: [authGuard] },
    { path: 'demo-servicios', loadComponent: () => import('./pages/dashboard-demo/dashboard-demo').then(m => m.DashboardDemoComponent), canActivate: [authGuard] },
    { path: 'demo-mixto', loadComponent: () => import('./pages/dashboard-demo/dashboard-demo').then(m => m.DashboardDemoComponent), canActivate: [authGuard] },
    { path: 'saas-admin', redirectTo: 'saas-admin/dashboard', pathMatch: 'full' },
    { path: 'saas-admin/:vista', loadComponent: () => import('./pages/saas-admin/saas-admin.component').then(m => m.SaasAdminComponent), canActivate: [authGuard] },
    
    // Dynamic Environment Routing
    { 
        path: ':entorno', 
        loadComponent: () => import('./pages/dashboard/dashboard-main/dashboard.component').then(m => m.DashboardComponent), 
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./pages/dashboard-home/dashboard-home').then(m => m.DashboardHome) },
            { path: 'administracion', loadComponent: () => import('./pages/dashboard/administracion/administracion.component').then(m => m.AdministracionComponent) },
            { path: 'empleados', loadComponent: () => import('./pages/dashboard/empleados/empleados.component').then(m => m.EmpleadosComponent) },
            { path: 'autogestion', loadComponent: () => import('./pages/dashboard/autogestion/autogestion').then(m => m.AutogestionComponent) },
            { path: 'pagos', loadComponent: () => import('./pages/dashboard/pagos/pagos.component').then(m => m.PagosComponent) },
            { path: 'clientes', loadComponent: () => import('./pages/dashboard/clientes/clientes').then(m => m.ClientesComponent) },
            { path: 'proveedores', loadComponent: () => import('./pages/dashboard/proveedores/proveedores').then(m => m.ProveedoresComponent) }
        ]
    },
    { path: '**', redirectTo: '' }
];
