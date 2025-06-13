import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { AvisDTO } from '../types/entities';
import { Observable } from 'rxjs';

/**
 * Service for handling review-related operations
 */
@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private readonly baseUrl = `${environment.apiUrl}/api/avis`;

  constructor(private http: HttpClient) { }

  /**
   * Get all reviews
   * @returns Observable of AvisDTO array
   */
  getAllAvis(): Observable<AvisDTO[]> {
    return this.http.get<AvisDTO[]>(this.baseUrl);
  }

  /**
   * Get reviews by space ID
   * @param espaceId Space ID
   * @returns Observable of AvisDTO array
   */
  getAvisByEspaceId(espaceId: number): Observable<AvisDTO[]> {
    return this.http.get<AvisDTO[]>(`${this.baseUrl}/espace/${espaceId}`);
  }

  /**
   * Get review by ID
   * @param id Review ID
   * @returns Observable of AvisDTO
   */
  getAvisById(id: number): Observable<AvisDTO> {
    return this.http.get<AvisDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new review
   * @param avis Review data
   * @returns Observable of created AvisDTO
   */
  createAvis(avis: AvisDTO): Observable<AvisDTO> {
    return this.http.post<AvisDTO>(this.baseUrl, avis);
  }

  /**
   * Delete a review
   * @param id Review ID
   * @returns Observable of void
   */
  deleteAvis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}