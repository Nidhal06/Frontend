import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders} from '@angular/common/http';
import { environment } from './environments/environment';
import { BookingDto } from './booking.model'; 
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/api/bookings`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  createBooking(booking: BookingDto): Observable<any> {
    return this.http.post(this.apiUrl, booking, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}