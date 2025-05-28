// src/app/_services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { ReservationDTO } from '../types/entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  constructor(private http: HttpClient) { }

  getAllReservations(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${environment.apiUrl}/api/reservations`);
  }

  getReservationById(id: number): Observable<ReservationDTO> {
    return this.http.get<ReservationDTO>(`${environment.apiUrl}/api/reservations/${id}`);
  }

  getReservationsByUser(userId: number): Observable<ReservationDTO[]> {
  return this.http.get<ReservationDTO[]>(`${environment.apiUrl}/api/reservations/user/${userId}`);
}

getReservationsBySpace(spaceId: number): Observable<ReservationDTO[]> {
  return this.http.get<ReservationDTO[]>(`${environment.apiUrl}/api/reservations/space/${spaceId}`);
}

  createReservation(reservation: ReservationDTO): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(`${environment.apiUrl}/api/reservations`, reservation);
  }

  updateReservation(id: number, reservation: ReservationDTO): Observable<ReservationDTO> {
    return this.http.put<ReservationDTO>(`${environment.apiUrl}/api/reservations/${id}`, reservation);
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/reservations/${id}`);
  }
}