
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { EspaceDTO, EspacePriveDTO, EspaceOuvertDTO } from '../types/entities';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EspaceService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllEspaces(): Observable<EspaceDTO[]> {
    return this.http.get<EspaceDTO[]>(`${environment.apiUrl}/api/espaces`);
  }

  getEspaceById(id: number): Observable<EspaceDTO> {
    return this.http.get<EspaceDTO>(`${environment.apiUrl}/api/espaces/${id}`);
  }

  createEspace(espaceDTO: EspaceDTO, photoPrincipal?: File, gallery?: File[]): Observable<EspaceDTO> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(espaceDTO));
    
    if (photoPrincipal) {
      formData.append('photoPrincipal', photoPrincipal);
    }
    
    if (gallery && gallery.length > 0) {
      gallery.forEach(file => formData.append('gallery', file));
    }
    
    return this.http.post<EspaceDTO>(
      `${environment.apiUrl}/api/espaces`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  updateEspace(id: number, espaceDTO: EspaceDTO, photoPrincipal?: File, gallery?: File[], imagesToDelete?: string[]): Observable<EspaceDTO> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(espaceDTO));
    
    if (photoPrincipal) {
      formData.append('photoPrincipal', photoPrincipal);
    }
    
    if (gallery && gallery.length > 0) {
      gallery.forEach(file => formData.append('gallery', file));
    }
    
    if (imagesToDelete && imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }
    
    return this.http.put<EspaceDTO>(
      `${environment.apiUrl}/api/espaces/${id}`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  deleteEspace(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/espaces/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  getAllEspacePrives(): Observable<EspacePriveDTO[]> {
    return this.http.get<EspacePriveDTO[]>(`${environment.apiUrl}/api/espaces/prives`);
  }

  getEspacePriveById(id: number): Observable<EspacePriveDTO> {
    return this.http.get<EspacePriveDTO>(`${environment.apiUrl}/api/espaces/prives/${id}`);
  }

  createEspacePrive(espaceDTO: EspacePriveDTO, photoPrincipal?: File, gallery?: File[]): Observable<EspacePriveDTO> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(espaceDTO));
    
    if (photoPrincipal) {
      formData.append('photoPrincipal', photoPrincipal);
    }
    
    if (gallery && gallery.length > 0) {
      gallery.forEach(file => formData.append('gallery', file));
    }
    
    return this.http.post<EspacePriveDTO>(
      `${environment.apiUrl}/api/espaces/prives`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  updateEspacePrive(id: number, espaceDTO: EspacePriveDTO, photoPrincipal?: File, gallery?: File[], imagesToDelete?: string[]): Observable<EspacePriveDTO> {
    const formData = new FormData();
    
    // Remove id from DTO to avoid conflicts
    const { id: _, ...dtoWithoutId } = espaceDTO;
    formData.append('data', JSON.stringify(dtoWithoutId));
    
    if (photoPrincipal) {
      formData.append('photoPrincipal', photoPrincipal);
    }
    
    if (gallery && gallery.length > 0) {
      gallery.forEach(file => formData.append('gallery', file));
    }
    
    if (imagesToDelete && imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }
    
    return this.http.put<EspacePriveDTO>(
      `${environment.apiUrl}/api/espaces/prives/${id}`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
}

  deleteEspacePrive(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/espaces/prives/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  getAllEspaceOuverts(): Observable<EspaceOuvertDTO[]> {
    return this.http.get<EspaceOuvertDTO[]>(`${environment.apiUrl}/api/espaces/ouverts`);
  }

  getEspaceOuvertById(id: number): Observable<EspaceOuvertDTO> {
    return this.http.get<EspaceOuvertDTO>(`${environment.apiUrl}/api/espaces/ouverts/${id}`);
  }

  createEspaceOuvert(espaceDTO: EspaceOuvertDTO, photoPrincipal?: File, gallery?: File[]): Observable<EspaceOuvertDTO> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(espaceDTO));
    
    if (photoPrincipal) {
      formData.append('photoPrincipal', photoPrincipal);
    }
    
    if (gallery && gallery.length > 0) {
      gallery.forEach(file => formData.append('gallery', file));
    }
    
    return this.http.post<EspaceOuvertDTO>(
      `${environment.apiUrl}/api/espaces/ouverts`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  updateEspaceOuvert(id: number, espaceDTO: EspaceOuvertDTO, photoPrincipal?: File, gallery?: File[], imagesToDelete?: string[]): Observable<EspaceOuvertDTO> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(espaceDTO));
    
    if (photoPrincipal) {
      formData.append('photoPrincipal', photoPrincipal);
    }
    
    if (gallery && gallery.length > 0) {
      gallery.forEach(file => formData.append('gallery', file));
    }
    
    if (imagesToDelete && imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }
    
    return this.http.put<EspaceOuvertDTO>(
      `${environment.apiUrl}/api/espaces/ouverts/${id}`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  deleteEspaceOuvert(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/espaces/ouverts/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }
}