import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { AvisDTO } from '../types/entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  constructor(private http: HttpClient) { }

  getAllAvis(): Observable<AvisDTO[]> {
    return this.http.get<AvisDTO[]>(`${environment.apiUrl}/api/avis`);
  }

  getAvisByEspaceId(espaceId: number): Observable<AvisDTO[]> {
    return this.http.get<AvisDTO[]>(`${environment.apiUrl}/api/avis/espace/${espaceId}`);
  }

  getAvisById(id: number): Observable<AvisDTO> {
    return this.http.get<AvisDTO>(`${environment.apiUrl}/api/avis/${id}`);
  }

  createAvis(avis: AvisDTO): Observable<AvisDTO> {
    return this.http.post<AvisDTO>(`${environment.apiUrl}/api/avis`, avis);
  }

  deleteAvis(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/avis/${id}`);
  }
}