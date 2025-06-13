import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { ReservationDTO } from '../types/entities';
import { Observable } from 'rxjs';

/**
 * Service for handling reservation-related operations
 */
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly baseUrl = `${environment.apiUrl}/api/reservations`;

  constructor(private http: HttpClient) { }

  /**
   * Get all reservations
   * @returns Observable of ReservationDTO array
   */
  getAllReservations(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(this.baseUrl);
  }

  /**
   * Get reservation by ID
   * @param id Reservation ID
   * @returns Observable of ReservationDTO
   */
  getReservationById(id: number): Observable<ReservationDTO> {
    return this.http.get<ReservationDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get reservations by user ID
   * @param userId User ID
   * @returns Observable of ReservationDTO array
   */
  getReservationsByUser(userId: number): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Get reservations by space ID
   * @param spaceId Space ID
   * @returns Observable of ReservationDTO array
   */
  getReservationsBySpace(spaceId: number): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.baseUrl}/space/${spaceId}`);
  }

  /**
   * Create a new reservation
   * @param reservation Reservation data
   * @returns Observable of created ReservationDTO
   */
  createReservation(reservation: ReservationDTO): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(this.baseUrl, reservation);
  }

  /**
   * Update a reservation
   * @param id Reservation ID
   * @param reservation Updated reservation data
   * @returns Observable of updated ReservationDTO
   */
  updateReservation(id: number, reservation: ReservationDTO): Observable<ReservationDTO> {
    return this.http.put<ReservationDTO>(`${this.baseUrl}/${id}`, reservation);
  }

  /**
   * Delete a reservation
   * @param id Reservation ID
   * @returns Observable of void
   */
  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}