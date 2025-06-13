import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from './environments/environment';
import { EvenementDTO, ParticipantDTO } from '../types/entities';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Service for handling event-related operations
 */
@Injectable({ 
  providedIn: 'root' 
})
export class EvenementService {
  private readonly baseUrl = `${environment.apiUrl}/api/evenements`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  /**
   * Get authorization headers
   * @returns HttpHeaders with auth token
   */
  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  /**
   * Get all events
   * @returns Observable of EvenementDTO array
   */
  getAllEvenements(): Observable<EvenementDTO[]> {
    return this.http.get<EvenementDTO[]>(this.baseUrl);
  }

  /**
   * Get event by ID
   * @param id Event ID
   * @returns Observable of EvenementDTO
   */
  getEvenementById(id: number): Observable<EvenementDTO> {
    return this.http.get<EvenementDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new event
   * @param evenement Event data
   * @returns Observable of created EvenementDTO
   */
  createEvenement(evenement: EvenementDTO): Observable<EvenementDTO> {
    return this.http.post<EvenementDTO>(
      this.baseUrl, 
      evenement,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Update an existing event
   * @param id Event ID
   * @param evenement Updated event data
   * @returns Observable of updated EvenementDTO
   */
  updateEvenement(id: number, evenement: EvenementDTO): Observable<EvenementDTO> {
    return this.http.put<EvenementDTO>(
      `${this.baseUrl}/${id}`, 
      evenement,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Delete an event
   * @param id Event ID
   * @returns Observable of void
   */
  deleteEvenement(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Register a participant for an event
   * @param evenementId Event ID
   * @param userId User ID
   * @returns Observable of EvenementDTO
   */
  registerParticipant(evenementId: number, userId: number): Observable<EvenementDTO> {
    return this.http.post<EvenementDTO>(
      `${this.baseUrl}/${evenementId}/register/${userId}`, 
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Cancel participation for an event
   * @param evenementId Event ID
   * @param userId User ID
   * @returns Observable of EvenementDTO
   */
  cancelParticipation(evenementId: number, userId: number): Observable<EvenementDTO> {
    return this.http.post<EvenementDTO>(
      `${this.baseUrl}/${evenementId}/cancel/${userId}`, 
      {},
      { headers: this.getHeaders() }
    );
  }
}