import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class DebugInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Requête envoyée:', request);
    return next.handle(request).pipe(
      tap(
        event => console.log('Réponse reçue:', event),
        error => console.error('Erreur reçue:', error)
      )
    );
  }
}