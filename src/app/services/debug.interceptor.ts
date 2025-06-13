import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/**
 * HTTP interceptor for debugging purposes (logs requests and responses).
 */
@Injectable()
export class DebugInterceptor implements HttpInterceptor {
  /**
   * Intercepts HTTP requests to log debug information.
   * @param request The outgoing request.
   * @param next The next interceptor in the chain.
   * @returns An observable of the HTTP event.
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('Request URL:', request.url);
    console.log('Request Method:', request.method);
    console.log('Request Headers:', request.headers);
    
    if (request.body) {
      console.log('Request Body:', request.body);
    }

    return next.handle(request).pipe(
      tap(response => {
        console.log('Response:', response);
      })
    );
  }
}