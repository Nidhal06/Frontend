
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './environments/environment';
import { EvenementDTO, ParticipantDTO } from '../types/entities';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EvenementService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  getAllEvenements(): Observable<EvenementDTO[]> {
    return this.http.get<EvenementDTO[]>(`${environment.apiUrl}/api/evenements`);
  }

  getEvenementById(id: number): Observable<EvenementDTO> {
    return this.http.get<EvenementDTO>(`${environment.apiUrl}/api/evenements/${id}`);
  }

  createEvenement(evenement: EvenementDTO): Observable<EvenementDTO> {
    return this.http.post<EvenementDTO>(
      `${environment.apiUrl}/api/evenements`, 
      evenement,
      { headers: this.getHeaders() }
    );
  }

  updateEvenement(id: number, evenement: EvenementDTO): Observable<EvenementDTO> {
    return this.http.put<EvenementDTO>(
      `${environment.apiUrl}/api/evenements/${id}`, 
      evenement,
      { headers: this.getHeaders() }
    );
  }

  deleteEvenement(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/evenements/${id}`,
      { headers: this.getHeaders() }
    );
  }

  registerParticipant(evenementId: number, userId: number): Observable<EvenementDTO> {
    return this.http.post<EvenementDTO>(
      `${environment.apiUrl}/api/evenements/${evenementId}/register/${userId}`, 
      {},
      { headers: this.getHeaders() }
    );
  }

  cancelParticipation(evenementId: number, userId: number): Observable<EvenementDTO> {
    return this.http.post<EvenementDTO>(
      `${environment.apiUrl}/api/evenements/${evenementId}/cancel/${userId}`, 
      {},
      { headers: this.getHeaders() }
    );
  }
}