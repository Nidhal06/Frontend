import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { AuthRequest, AuthResponse, SignupRequest } from '../types/entities';
import { BehaviorSubject, Observable, map } from 'rxjs';

/**
 * Authentication service for handling user authentication and authorization.
 */
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

  /**
   * Gets the current user value.
   * @returns The current user or null if not authenticated.
   */
  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  /**
   * Logs in a user with email and password.
   * @param authRequest The authentication request containing email and password.
   * @returns Observable of the authentication response.
   */
  login(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/api/auth/signin`, 
      authRequest
    ).pipe(
      map(response => {
        // Store user details and jwt token in local storage
        localStorage.setItem('currentUser', JSON.stringify(response));
        this.currentUserSubject.next(response);
        return response;
      })
    );
  }

  /**
   * Registers a new user.
   * @param signupRequest The signup request containing user details.
   * @returns Observable of the registration response.
   */
  register(signupRequest: SignupRequest): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/auth/signup`, 
      signupRequest
    );
  }

  /**
   * Logs out the current user by removing user data from local storage.
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Checks if a user is logged in.
   * @returns True if user is logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  /**
   * Checks if the current user has admin role.
   * @returns True if user is admin, false otherwise.
   */
  isAdmin(): boolean {
    return this.currentUserValue?.role === 'ADMIN';
  }

  /**
   * Checks if the current user has receptionist role.
   * @returns True if user is receptionist, false otherwise.
   */
  isReceptionist(): boolean {
    return this.currentUserValue?.role === 'RECEPTIONISTE';
  }

  /**
   * Checks if the current user has coworker role.
   * @returns True if user is coworker, false otherwise.
   */
  isCoworker(): boolean {
    return this.currentUserValue?.role === 'COWORKER';
  }

  /**
   * Gets the JWT token of the current user.
   * @returns The JWT token or null if not authenticated.
   */
  getToken(): string | null {
    const currentUser = this.currentUserValue;
    return currentUser ? currentUser.token : null;
  }

  /**
   * Gets the current user's ID.
   * @returns The user ID or null if not authenticated.
   */
  getCurrentUserId(): number | null {
    const currentUser = this.currentUserValue;
    return currentUser && currentUser.userId !== undefined ? currentUser.userId : null;
  }

  /**
   * Gets authorization headers with JWT token for JSON content.
   * @returns HttpHeaders with authorization token.
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Gets authorization headers with JWT token for form data.
   * @returns HttpHeaders with authorization token.
   */
  getAuthHeadersForFormData(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Initiates password reset process.
   * @param email The user's email address.
   * @returns Observable of the reset password response.
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/auth/forgot-password`, 
      { email }
    );
  }

  /**
   * Resets user password with a valid token.
   * @param token The password reset token.
   * @param newPassword The new password.
   * @returns Observable of the reset password response.
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/api/auth/reset-password`, 
      { token, newPassword }
    );
  }
}