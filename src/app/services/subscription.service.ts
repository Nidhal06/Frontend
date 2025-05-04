import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from './environments/environment';

export interface Subscription {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  price: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING_PAYMENT';
  type: 'INDIVIDUAL' | 'TEAM';
  billingCycle: 'MONTHLY' | 'YEARLY';
  maxWorkspaces: number;
  includedHours: number;
  hourlyRate: number;
  user: {
    id: number;
    username: string;
    type: string;
  };
}

export interface SubscriptionPlan {
  type: 'INDIVIDUAL' | 'TEAM';
  name: string;
  description: string;
  features: string[];
  billingCycle: 'MONTHLY' | 'YEARLY';
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/api/admin/subscriptions`;
  private plansUrl = `${environment.apiUrl}/api/subscription-plans`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSubscriptionById(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSubscriptionsByUser(userId: number): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getActiveSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/active`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSubscriptionsByType(type: 'INDIVIDUAL' | 'TEAM'): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/type/${type}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createSubscription(subscriptionData: any): Observable<Subscription> {
    return this.http.post<Subscription>(this.apiUrl, subscriptionData, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Update localStorage if subscription is for current user
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && subscriptionData.userId === currentUser.id) {
            localStorage.setItem('currentSubscription', JSON.stringify(response));
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateSubscription(id: number, subscriptionData: any): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.apiUrl}/${id}`, subscriptionData, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Update localStorage if subscription is for current user
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && subscriptionData.userId === currentUser.id) {
            localStorage.setItem('currentSubscription', JSON.stringify(response));
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  cancelSubscription(id: number): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          // Update localStorage if subscription is for current user
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && response.user.id === currentUser.id) {
            localStorage.removeItem('currentSubscription');
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteSubscription(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(() => {
          // Check if deleted subscription was the current user's
          const currentSubscription = JSON.parse(localStorage.getItem('currentSubscription') || 'null');
          if (currentSubscription && currentSubscription.id === id) {
            localStorage.removeItem('currentSubscription');
          }
        }),
        catchError(this.handleError)
      );
  }

  getAvailablePlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(this.plansUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getSubscriptionOptions(spaceId: number): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(
      `${environment.apiUrl}/api/admin/spaces/${spaceId}/subscription-options`, 
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}