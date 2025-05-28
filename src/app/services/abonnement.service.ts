
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { AbonnementDTO } from '../types/entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbonnementService {
  constructor(private http: HttpClient) { }

  getAllAbonnements(): Observable<AbonnementDTO[]> {
    return this.http.get<AbonnementDTO[]>(`${environment.apiUrl}/api/abonnements`);
  }

  getAbonnementById(id: number): Observable<AbonnementDTO> {
    return this.http.get<AbonnementDTO>(`${environment.apiUrl}/api/abonnements/${id}`);
  }

  getAbonnementsByUser(userId: number): Observable<AbonnementDTO[]> {
  return this.http.get<AbonnementDTO[]>(`${environment.apiUrl}/api/abonnements/user/${userId}`);
}

  createAbonnement(abonnement: AbonnementDTO): Observable<AbonnementDTO> {
    return this.http.post<AbonnementDTO>(`${environment.apiUrl}/api/abonnements`, abonnement);
  }

  createAbonnementsForAllCoworkers(abonnement: AbonnementDTO): Observable<AbonnementDTO> {
    return this.http.post<AbonnementDTO>(`${environment.apiUrl}/api/abonnements/for-all-coworkers`, abonnement);
  }

  updateAbonnement(id: number, abonnement: AbonnementDTO): Observable<AbonnementDTO> {
    return this.http.put<AbonnementDTO>(`${environment.apiUrl}/api/abonnements/${id}`, abonnement);
  }

  deleteAbonnement(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/abonnements/${id}`);
  }
}