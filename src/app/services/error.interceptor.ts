// error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Non autorisé - déconnecter l'utilisateur
          this.authService.logout();
          this.router.navigate(['/login']);
          Swal.fire('Session expirée', 'Veuillez vous reconnecter', 'warning');
        } else if (error.status >= 500) {
          // Erreur serveur
          Swal.fire('Erreur serveur', 'Une erreur est survenue côté serveur', 'error');
        } else if (error.status === 404) {
          // Ressource non trouvée
          Swal.fire('Non trouvé', 'La ressource demandée n\'existe pas', 'error');
        } else if (error.status === 400) {
          // Mauvaise requête
          const message = error.error?.message || 'Requête invalide';
          Swal.fire('Erreur', message, 'error');
        }

        return throwError(() => error);
      })
    );
  }
}