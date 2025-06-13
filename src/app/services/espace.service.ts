import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { EspaceDTO, EspacePriveDTO, EspaceOuvertDTO } from '../types/entities';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Service for managing spaces (both private and open spaces).
 */
@Injectable({
  providedIn: 'root'
})
export class EspaceService {
  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }

  // General Space Methods

  /**
   * Gets all spaces.
   * @returns Observable of EspaceDTO array.
   */
  getAllEspaces(): Observable<EspaceDTO[]> {
    return this.http.get<EspaceDTO[]>(`${environment.apiUrl}/api/espaces`);
  }

  /**
   * Gets a space by ID.
   * @param id The space ID.
   * @returns Observable of EspaceDTO.
   */
  getEspaceById(id: number): Observable<EspaceDTO> {
    return this.http.get<EspaceDTO>(`${environment.apiUrl}/api/espaces/${id}`);
  }

  /**
   * Creates a new space.
   * @param espaceDTO The space data.
   * @param photoPrincipal The main photo file.
   * @param gallery The gallery photo files.
   * @returns Observable of the created EspaceDTO.
   */
  createEspace(
    espaceDTO: EspaceDTO, 
    photoPrincipal?: File, 
    gallery?: File[]
  ): Observable<EspaceDTO> {
    const formData = this.createSpaceFormData(espaceDTO, photoPrincipal, gallery);
    return this.http.post<EspaceDTO>(
      `${environment.apiUrl}/api/espaces`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  /**
   * Updates an existing space.
   * @param id The space ID.
   * @param espaceDTO The updated space data.
   * @param photoPrincipal The updated main photo file.
   * @param gallery The updated gallery photo files.
   * @param imagesToDelete The images to delete.
   * @returns Observable of the updated EspaceDTO.
   */
  updateEspace(
    id: number, 
    espaceDTO: EspaceDTO, 
    photoPrincipal?: File, 
    gallery?: File[], 
    imagesToDelete?: string[]
  ): Observable<EspaceDTO> {
    const formData = this.createSpaceFormData(espaceDTO, photoPrincipal, gallery, imagesToDelete);
    return this.http.put<EspaceDTO>(
      `${environment.apiUrl}/api/espaces/${id}`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  /**
   * Deletes a space.
   * @param id The space ID.
   * @returns Observable of void.
   */
  deleteEspace(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/espaces/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // Private Space Methods

  /**
   * Gets all private spaces.
   * @returns Observable of EspacePriveDTO array.
   */
  getAllEspacePrives(): Observable<EspacePriveDTO[]> {
    return this.http.get<EspacePriveDTO[]>(`${environment.apiUrl}/api/espaces/prives`);
  }

  /**
   * Gets a private space by ID.
   * @param id The private space ID.
   * @returns Observable of EspacePriveDTO.
   */
  getEspacePriveById(id: number): Observable<EspacePriveDTO> {
    return this.http.get<EspacePriveDTO>(`${environment.apiUrl}/api/espaces/prives/${id}`);
  }

  /**
   * Creates a new private space.
   * @param espaceDTO The private space data.
   * @param photoPrincipal The main photo file.
   * @param gallery The gallery photo files.
   * @returns Observable of the created EspacePriveDTO.
   */
  createEspacePrive(
    espaceDTO: EspacePriveDTO, 
    photoPrincipal?: File, 
    gallery?: File[]
  ): Observable<EspacePriveDTO> {
    const formData = this.createSpaceFormData(espaceDTO, photoPrincipal, gallery);
    return this.http.post<EspacePriveDTO>(
      `${environment.apiUrl}/api/espaces/prives`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  /**
   * Updates an existing private space.
   * @param id The private space ID.
   * @param espaceDTO The updated private space data.
   * @param photoPrincipal The updated main photo file.
   * @param gallery The updated gallery photo files.
   * @param imagesToDelete The images to delete.
   * @returns Observable of the updated EspacePriveDTO.
   */
  updateEspacePrive(
    id: number, 
    espaceDTO: EspacePriveDTO, 
    photoPrincipal?: File, 
    gallery?: File[], 
    imagesToDelete?: string[]
  ): Observable<EspacePriveDTO> {
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

  /**
   * Deletes a private space.
   * @param id The private space ID.
   * @returns Observable of void.
   */
  deleteEspacePrive(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/espaces/prives/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // Open Space Methods

  /**
   * Gets all open spaces.
   * @returns Observable of EspaceOuvertDTO array.
   */
  getAllEspaceOuverts(): Observable<EspaceOuvertDTO[]> {
    return this.http.get<EspaceOuvertDTO[]>(`${environment.apiUrl}/api/espaces/ouverts`);
  }

  /**
   * Gets an open space by ID.
   * @param id The open space ID.
   * @returns Observable of EspaceOuvertDTO.
   */
  getEspaceOuvertById(id: number): Observable<EspaceOuvertDTO> {
    return this.http.get<EspaceOuvertDTO>(`${environment.apiUrl}/api/espaces/ouverts/${id}`);
  }

  /**
   * Creates a new open space.
   * @param espaceDTO The open space data.
   * @param photoPrincipal The main photo file.
   * @param gallery The gallery photo files.
   * @returns Observable of the created EspaceOuvertDTO.
   */
  createEspaceOuvert(
    espaceDTO: EspaceOuvertDTO, 
    photoPrincipal?: File, 
    gallery?: File[]
  ): Observable<EspaceOuvertDTO> {
    const formData = this.createSpaceFormData(espaceDTO, photoPrincipal, gallery);
    return this.http.post<EspaceOuvertDTO>(
      `${environment.apiUrl}/api/espaces/ouverts`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  /**
   * Updates an existing open space.
   * @param id The open space ID.
   * @param espaceDTO The updated open space data.
   * @param photoPrincipal The updated main photo file.
   * @param gallery The updated gallery photo files.
   * @param imagesToDelete The images to delete.
   * @returns Observable of the updated EspaceOuvertDTO.
   */
  updateEspaceOuvert(
    id: number, 
    espaceDTO: EspaceOuvertDTO, 
    photoPrincipal?: File, 
    gallery?: File[], 
    imagesToDelete?: string[]
  ): Observable<EspaceOuvertDTO> {
    const formData = this.createSpaceFormData(espaceDTO, photoPrincipal, gallery, imagesToDelete);
    return this.http.put<EspaceOuvertDTO>(
      `${environment.apiUrl}/api/espaces/ouverts/${id}`, 
      formData,
      { headers: this.authService.getAuthHeadersForFormData() }
    );
  }

  /**
   * Deletes an open space.
   * @param id The open space ID.
   * @returns Observable of void.
   */
  deleteEspaceOuvert(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/espaces/ouverts/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  // Helper Methods

  /**
   * Creates FormData for space operations.
   * @param dto The space DTO.
   * @param photoPrincipal The main photo file.
   * @param gallery The gallery photo files.
   * @param imagesToDelete The images to delete.
   * @returns FormData object.
   */
  private createSpaceFormData(
    dto: any,
    photoPrincipal?: File,
    gallery?: File[],
    imagesToDelete?: string[]
  ): FormData {
    const formData = new FormData();
    formData.append('data', JSON.stringify(dto));
    
    if (photoPrincipal) {
      formData.append('photoPrincipal', photoPrincipal);
    }
    
    if (gallery && gallery.length > 0) {
      gallery.forEach(file => formData.append('gallery', file));
    }
    
    if (imagesToDelete && imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }
    
    return formData;
  }
}