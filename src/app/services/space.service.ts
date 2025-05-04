import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable , map} from 'rxjs';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {
  private apiUrl = `${environment.apiUrl}/api/admin/spaces`;

  constructor(private http: HttpClient) { }

  getAllSpaces(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(spaces => spaces.map(space => ({
        ...space,
        photo: space.photo ? `${environment.apiUrl}${space.photo}` : 'assets/images/default-space.jpg',
        gallery: space.gallery ? space.gallery.map((img: string) => `${environment.apiUrl}${img}`) : [],
        amenities: space.amenities || []
      })))
    );
  }

  getSpaceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(space => ({
        ...space,
        photo: space.photo ? `${environment.apiUrl}${space.photo}` : 'assets/images/default-space.jpg',
        gallery: space.gallery ? space.gallery.map((img: string) => `${environment.apiUrl}${img}`) : [],
        amenities: space.amenities || []
      }))
    );
  }

  createSpace(spaceData: any, photo: File, gallery?: File[]): Observable<any> {
    const formData = new FormData();
    
    formData.append('photo', photo);
    
    if (gallery) {
      gallery.forEach(file => {
        formData.append('gallery', file);
      });
    }
    
    return this.http.post<any>(this.apiUrl, formData);
  }

  updateSpace(id: number, spaceData: any, photo?: File, gallery?: File[]): Observable<any> {
    const formData = new FormData();
    
    const spaceDto = {
      id: id, 
      name: spaceData.name,
      description: spaceData.description,
      capacity: spaceData.capacity,
      pricePerHour: spaceData.pricePerHour,
      pricePerDay: spaceData.pricePerDay,
      isActive: spaceData.isActive,
      amenityIds: spaceData.amenityIds || []
    };
  
    formData.append('space', new Blob([JSON.stringify(spaceDto)], {
      type: 'application/json'
    }));
    
    if (photo) {
      formData.append('photo', photo);
    }
    
    if (gallery && gallery.length > 0) {
      gallery.forEach(file => formData.append('gallery', file));
    }
  
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  deleteSpace(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleSpaceStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}