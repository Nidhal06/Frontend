import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmenityService {
  private apiUrl = `${environment.apiUrl}/api/admin/amenities`;

  constructor(private http: HttpClient) { }

  getAllAmenities(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}