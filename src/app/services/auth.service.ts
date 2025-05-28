
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { AuthRequest, AuthResponse, SignupRequest } from '../types/entities';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private currentUserSubject: BehaviorSubject<AuthResponse | null>;
  public currentUser: Observable<AuthResponse | null>;

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(
      user ? JSON.parse(user) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }


  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }


login(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/signin`, authRequest)
      .pipe(
        map(response => {
          // Store user details and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
          return response;
        })
      );
  }

  register(signupRequest: SignupRequest): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/signup`, signupRequest);
  }

  logout() {
    // Remove user from local storage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'ADMIN';
  }

  isReceptionist(): boolean {
    return this.currentUserValue?.role === 'RECEPTIONISTE';
  }

  isCoworker(): boolean {
    return this.currentUserValue?.role === 'COWORKER';
  }

  getToken(): string | null {
    const currentUser = this.currentUserValue;
    return currentUser ? currentUser.token : null;
  }

  getCurrentUserId(): number | null {
    const currentUser = this.currentUserValue;
    return currentUser && currentUser.userId !== undefined ? currentUser.userId : null;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAuthHeadersForFormData(): HttpHeaders {
  const token = this.getToken();
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  }

  forgotPassword(email: string): Observable<any> {
  return this.http.post(`${environment.apiUrl}/api/auth/forgot-password`, { email });
 }

  resetPassword(token: string, newPassword: string): Observable<any> {
  return this.http.post(`${environment.apiUrl}/api/auth/reset-password`, { 
    token, 
    newPassword 
  });
  }
}