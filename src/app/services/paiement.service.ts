
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { PaiementDTO } from '../types/entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  constructor(private http: HttpClient) { }

  getAllPaiements(): Observable<PaiementDTO[]> {
    return this.http.get<PaiementDTO[]>(`${environment.apiUrl}/api/paiements`);
  }

  getPaiementById(id: number): Observable<PaiementDTO> {
    return this.http.get<PaiementDTO>(`${environment.apiUrl}/api/paiements/${id}`);
  }

  createPaiement(paiement: PaiementDTO): Observable<PaiementDTO> {
    return this.http.post<PaiementDTO>(`${environment.apiUrl}/api/paiements`, paiement);
  }

  updatePaiement(id: number, paiement: PaiementDTO): Observable<PaiementDTO> {
    return this.http.put<PaiementDTO>(`${environment.apiUrl}/api/paiements/${id}`, paiement);
  }

  deletePaiement(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/paiements/${id}`);
  }
}