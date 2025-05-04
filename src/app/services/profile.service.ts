import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environments/environment';
import { UserProfile } from './user-profile.model';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/api/profile`;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  updateProfile(profileData: any): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiUrl, profileData);
  }

  updateProfileImage(file: File): Observable<{ imagePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imagePath: string }>(`${this.apiUrl}/image`, formData);
}
}