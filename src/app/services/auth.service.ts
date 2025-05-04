import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from './environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper = new JwtHelperService();
  private tokenKey = 'coworking-auth-token';
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  private profileUpdated = new BehaviorSubject<any>(null);
  profileUpdated$ = this.profileUpdated.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getCurrentUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/signin`, credentials).pipe(
        tap((response: any) => {
            if (response.token) {
                localStorage.setItem(this.tokenKey, response.token);
                
                const user = {
                    id: response.id,
                    username: response.username,
                    email: response.email,
                    phone: response.phone,
                    profileImagePath: response.profileImagePath,
                    roles: response.roles, // Les rôles sont maintenant disponibles
                    type: response.type
                };
                
                this.currentUserSubject.next(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
        }),
        catchError((error: any) => {
            console.error('Login error:', error);
            return throwError(() => error);
        })
    );
   }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
    
    const token = this.getToken();
    if (!token) return null;
    
    try {
      return this.jwtHelper.decodeToken(token);
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  getRoleBasedRedirectPath(role: string): string {
    if (!role) return '/';
    
    // Normaliser le rôle
    const normalizedRole = role.replace('ROLE_', '').toUpperCase();
    
    if (normalizedRole.includes('ADMIN')) {
      return '/admin-dashboard';
    }
    
    switch(normalizedRole) {
      case 'COWORKER': return '/coworker-dashboard';
      case 'COMPANY': return '/company-dashboard';
      case 'RECEPTIONIST': return '/reception-dashboard';
      case 'ACCOUNTANT': return '/accounting-dashboard';
      default: return '/';
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/signup`, userData, { 
      observe: 'response',
      responseType: 'text' // Force le traitement comme texte
    }).pipe(
      map(response => {
        // Accepte les réponses vides avec statut 200
        if (response.status === 200) {
          return { success: true };
        }
        throw response;
      }),
      catchError(error => {
        console.error('Erreur d\'inscription:', error);
        let errorMsg = 'Erreur lors de l\'inscription';
        if (error.error) {
          try {
            const err = JSON.parse(error.error);
            errorMsg = err.message || errorMsg;
          } catch {
            errorMsg = error.error;
          }
        }
        return throwError(() => errorMsg);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  hasRole(roles: string[]): boolean {
    const userRoles = this.getCurrentUser()?.roles || [];
    return roles.some(role => userRoles.includes(role));
  }

  notifyProfileUpdate(updatedUser: any) {
    this.profileUpdated.next(updatedUser);
  }

  hasActiveSubscription(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Vérifie dans le localStorage si l'utilisateur a un abonnement actif
    const subscription = localStorage.getItem('currentSubscription');
    if (subscription) {
      const subData = JSON.parse(subscription);
      const today = new Date();
      const endDate = new Date(subData.endDate);
      return endDate >= today && subData.status === 'ACTIVE';
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/signin']);
  }
}