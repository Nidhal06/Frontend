import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { FactureDTO } from '../types/entities';
import { Observable } from 'rxjs';

/**
 * Service for handling invoice-related operations
 */
@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private readonly baseUrl = `${environment.apiUrl}/api/factures`;

  constructor(private http: HttpClient) { }

  /**
   * Get all invoices
   * @returns Observable of FactureDTO array
   */
  getAllFactures(): Observable<FactureDTO[]> {
    return this.http.get<FactureDTO[]>(this.baseUrl);
  }

  /**
   * Get invoice by ID
   * @param id Invoice ID
   * @returns Observable of FactureDTO
   */
  getFactureById(id: number): Observable<FactureDTO> {
    return this.http.get<FactureDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new invoice
   * @param facture Invoice data
   * @returns Observable of created FactureDTO
   */
  createFacture(facture: FactureDTO): Observable<FactureDTO> {
    return this.http.post<FactureDTO>(this.baseUrl, facture);
  }

  /**
   * Delete an invoice
   * @param id Invoice ID
   * @returns Observable of void
   */
  deleteFacture(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}