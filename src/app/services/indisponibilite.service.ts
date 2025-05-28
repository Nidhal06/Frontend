
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { IndisponibiliteDTO } from '../types/entities';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IndisponibiliteService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllIndisponibilites(): Observable<IndisponibiliteDTO[]> {
    return this.http.get<IndisponibiliteDTO[]>(
      `${environment.apiUrl}/api/indisponibilites`
    );
  }

  getIndisponibiliteById(id: number): Observable<IndisponibiliteDTO> {
    return this.http.get<IndisponibiliteDTO>(`${environment.apiUrl}/api/indisponibilites/${id}`);
  }

  createIndisponibilite(indisponibilite: IndisponibiliteDTO): Observable<IndisponibiliteDTO> {
    return this.http.post<IndisponibiliteDTO>(`${environment.apiUrl}/api/indisponibilites`, indisponibilite);
  }

  updateIndisponibilite(id: number, indisponibilite: IndisponibiliteDTO): Observable<IndisponibiliteDTO> {
    return this.http.put<IndisponibiliteDTO>(`${environment.apiUrl}/api/indisponibilites/${id}`, indisponibilite);
  }

  deleteIndisponibilite(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/indisponibilites/${id}`);
  }
}