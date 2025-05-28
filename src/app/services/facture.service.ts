
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { FactureDTO } from '../types/entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  constructor(private http: HttpClient) { }

  getAllFactures(): Observable<FactureDTO[]> {
    return this.http.get<FactureDTO[]>(`${environment.apiUrl}/api/factures`);
  }

  getFactureById(id: number): Observable<FactureDTO> {
    return this.http.get<FactureDTO>(`${environment.apiUrl}/api/factures/${id}`);
  }

  createFacture(facture: FactureDTO): Observable<FactureDTO> {
    return this.http.post<FactureDTO>(`${environment.apiUrl}/api/factures`, facture);
  }

  deleteFacture(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/factures/${id}`);
  }
}