import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

canActivate(): boolean {
  const user = this.authService.getCurrentUser();
  
  if (!user) {
    this.router.navigate(['/signin']);
    return false;
  }

  // Vérification des rôles
  const hasAdminRole = user.roles && 
                      user.roles.some((role: string) => 
                        role.includes('ADMIN') || role === 'ROLE_ADMIN');
  
  if (hasAdminRole) {
    return true;
  }

  // Redirection vers la page d'accueil si pas admin
  this.router.navigate(['/']);
  return false;
}
}
