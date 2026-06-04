import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./auth/registration-component/registration-component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'homepage', 
    loadComponent: () => import('./Components/home-component/home-component').then(m => m.HomeComponent) 
  },
  { 
    path: 'history', 
    loadComponent: () => import('./Components/history-component/history-component').then(m => m.HistoryComponent),
    canActivate: [authGuard] 
  },
  {
    path: 'termsAndPolicies',
    loadComponent: () => import('./Components/terms-and-policies-component/terms-and-policies-component').then(m => m.TermsAndPoliciesComponent)
  },
  { path: '', redirectTo: 'homepage', pathMatch: 'full' },
  { path: '**', redirectTo: 'homepage' }
];