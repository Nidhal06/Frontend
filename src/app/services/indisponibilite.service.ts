import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { IndisponibiliteDTO } from '../types/entities';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Service for handling unavailability-related operations
 */
@Injectable({
  providedIn: 'root'
})
export class IndisponibiliteService {
  private readonly baseUrl = `${environment.apiUrl}/api/indisponibilites`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }

  /**
   * Get all unavailabilities
   * @returns Observable of IndisponibiliteDTO array
   */
  getAllIndisponibilites(): Observable<IndisponibiliteDTO[]> {
    return this.http.get<IndisponibiliteDTO[]>(this.baseUrl);
  }

  /**
   * Get unavailability by ID
   * @param id Unavailability ID
   * @returns Observable of IndisponibiliteDTO
   */
  getIndisponibiliteById(id: number): Observable<IndisponibiliteDTO> {
    return this.http.get<IndisponibiliteDTO>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new unavailability
   * @param indisponibilite Unavailability data
   * @returns Observable of created IndisponibiliteDTO
   */
  createIndisponibilite(indisponibilite: IndisponibiliteDTO): Observable<IndisponibiliteDTO> {
    return this.http.post<IndisponibiliteDTO>(this.baseUrl, indisponibilite);
  }

  /**
   * Update an unavailability
   * @param id Unavailability ID
   * @param indisponibilite Updated unavailability data
   * @returns Observable of updated IndisponibiliteDTO
   */
  updateIndisponibilite(id: number, indisponibilite: IndisponibiliteDTO): Observable<IndisponibiliteDTO> {
    return this.http.put<IndisponibiliteDTO>(`${this.baseUrl}/${id}`, indisponibilite);
  }

  /**
   * Delete an unavailability
   * @param id Unavailability ID
   * @returns Observable of void
   */
  deleteIndisponibilite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}