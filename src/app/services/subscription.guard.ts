// subscription.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.authService.isLoggedIn() && this.authService.hasActiveSubscription()) {
      return true;
    }
    
    // Redirige vers la page des abonnements si pas d'abonnement actif
    return this.router.createUrlTree(['/pricing']);
  }
}