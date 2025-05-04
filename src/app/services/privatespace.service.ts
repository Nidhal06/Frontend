import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable , map} from 'rxjs';
import { environment } from './environments/environment';
import { PrivateSpace } from './space.model';


@Injectable({
    providedIn: 'root'
  })
  export class PrivateSpaceService {
    private apiUrl = `${environment.apiUrl}/api/admin/spaces`;
  
    constructor(private http: HttpClient) { }
  
    getAllSpaces(): Observable<PrivateSpace[]> {
      return this.http.get<PrivateSpace[]>(this.apiUrl).pipe(
        map(spaces => spaces.map(space => ({
          ...space,
          photoUrl: space.photo ? `${environment.apiUrl}${space.photo}` : 'assets/images/default-space.jpg',
          galleryUrls: space.gallery ? space.gallery.map(img => `${environment.apiUrl}${img}`) : [],
          amenities: space.amenities || []
        })))
      );
    }
  
    getSpaceById(id: number): Observable<PrivateSpace> {
      return this.http.get<PrivateSpace>(`${this.apiUrl}/${id}`).pipe(
        map(space => ({
          ...space,
          photoUrl: space.photo ? `${environment.apiUrl}${space.photo}` : 'assets/images/default-space.jpg',
          galleryUrls: space.gallery ? space.gallery.map(img => `${environment.apiUrl}${img}`) : [],
          amenities: space.amenities || []
        }))
      );
    }
  
    createSpace(spaceData: any, photo: File, gallery: File[] = []): Observable<PrivateSpace> {
      const formData = new FormData();
      
      // Append space data as JSON
      formData.append('private_space', new Blob([JSON.stringify(spaceData)], {
        type: 'application/json'
      }));
      
      // Append main photo
      if (photo) {
        formData.append('photo', photo);
      }
      
      // Append gallery images
      gallery.forEach(file => {
        formData.append('gallery', file);
      });
      
      return this.http.post<PrivateSpace>(this.apiUrl, formData);
    }
  
    updateSpace(id: number, spaceData: any, photo?: File, gallery: File[] = []): Observable<PrivateSpace> {
      const formData = new FormData();
      
      // Append space data as JSON
      formData.append('private_space', new Blob([JSON.stringify({
        ...spaceData,
        id: id
      })], {
        type: 'application/json'
      }));
      
      // Append main photo if provided
      if (photo) {
        formData.append('photo', photo);
      }
      
      // Append gallery images if provided
      if (gallery && gallery.length > 0) {
        gallery.forEach(file => formData.append('gallery', file));
      }
    
      return this.http.put<PrivateSpace>(`${this.apiUrl}/${id}`, formData);
    }
  
    deleteSpace(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
  
    toggleSpaceStatus(id: number): Observable<PrivateSpace> {
      return this.http.patch<PrivateSpace>(`${this.apiUrl}/${id}/toggle-status`, {});
    }
  
    addAmenitiesToSpace(spaceId: number, amenityIds: number[]): Observable<PrivateSpace> {
      return this.http.post<PrivateSpace>(`${this.apiUrl}/${spaceId}/amenities`, amenityIds);
    }
  
    removeAmenitiesFromSpace(spaceId: number, amenityIds: number[]): Observable<PrivateSpace> {
      return this.http.delete<PrivateSpace>(`${this.apiUrl}/${spaceId}/amenities`, {
        body: amenityIds
      });
    }
  }