import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ReportComponent } from './pages/dashboard/report/report.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { RoleGuard } from './Guard/RoleGuard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: ReportComponent,
    canActivate: [RoleGuard],
    data: {
     roles: ['User']
    }
  },
  { path: 'unauthorized', component: UnauthorizedComponent }

];
