import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import { Observable , catchError , throwError } from 'rxjs';
import { environment } from './environments/environment';
import { Event } from './event.model';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/api/admin/events`;

  constructor(private http: HttpClient , private readonly authService : AuthService) { }

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl).pipe(
        catchError(error => {
            console.error('Error fetching events:', error);
            return throwError(() => new Error('Failed to fetch events'));
        })
    );
}

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, {
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      spaceId: event.spaceId,
      maxParticipants: event.maxParticipants,
      price: event.price
      // Note: isActive n'est pas envoyé car il a une valeur par défaut dans le backend
    });
  }

  updateEvent(id: number, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, {
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      spaceId: event.spaceId,
      maxParticipants: event.maxParticipants,
      price: event.price,
      isActive: event.isActive
    });
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleEventStatus(id: number, isActive: boolean): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/toggle-status`, { isActive });
  }

  registerToEvent(eventId: number, userId: number): Observable<Event> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    
    return this.http.post<Event>(
      `${this.apiUrl}/${eventId}/register/${userId}`, 
      {},
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  registerTeamToEvent(eventId: number, companyId: number, memberIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${eventId}/register-team/${companyId}`, memberIds);
  }
  
  unregisterFromEvent(eventId: number, userId: number): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/${eventId}/unregister/${userId}`, {});
  }
  
  checkRegistration(eventId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${eventId}/check-registration/${userId}`);
  }
}