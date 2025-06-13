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
import { AuthService } from './auth.service';

/**
 * HTTP interceptor to handle errors globally.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Intercepts HTTP requests to handle errors.
   * @param request The outgoing request.
   * @param next The next interceptor in the chain.
   * @returns An observable of the HTTP event.
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = error.error?.message || error.message || error.statusText;
          
          if (error.status === 400) {
            errorMessage = error.error || 'Invalid request';
          } else if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/signin']);
          } else if (error.status === 403) {
            this.router.navigate(['/']);
          }
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}