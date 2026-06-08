import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../Services/AuthService';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {

    const expectedRoles = route.data['roles'] as string[];

    const userRole = this.auth.getUserRole();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!expectedRoles.includes(userRole || '')) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
