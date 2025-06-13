import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { PaiementDTO } from '../types/entities';
import { Observable } from 'rxjs';

/**
 * Service for handling payment-related operations
 */
@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private readonly baseUrl = `${environment.apiUrl}/api/paiements`;

  constructor(private http: HttpClient) { }

  /**
   * Get all payments
   * @returns Observable of PaiementDTO array
   */
  getAllPaiements(): Observable<PaiementDTO[]> {
    return this.http.get<PaiementDTO[]>(this.baseUrl);
  }

  /**
   * Get payment by ID
   * @param id Payment ID
   * @returns Observable of PaiementDTO
   */
  getPaiementById(id: number): Observable<PaiementDTO> {
    return this.http.get<PaiementDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new payment
   * @param paiement Payment data
   * @returns Observable of created PaiementDTO
   */
  createPaiement(paiement: PaiementDTO): Observable<PaiementDTO> {
    return this.http.post<PaiementDTO>(this.baseUrl, paiement);
  }

  /**
   * Update a payment
   * @param id Payment ID
   * @param paiement Updated payment data
   * @returns Observable of updated PaiementDTO
   */
  updatePaiement(id: number, paiement: PaiementDTO): Observable<PaiementDTO> {
    return this.http.put<PaiementDTO>(`${this.baseUrl}/${id}`, paiement);
  }

  /**
   * Delete a payment
   * @param id Payment ID
   * @returns Observable of void
   */
  deletePaiement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}