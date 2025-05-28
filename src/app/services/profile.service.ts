import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { ProfilDto, ProfileUpdateDTO } from '../types/entities';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileUpdatedSubject = new BehaviorSubject<ProfilDto | null>(null);
  profileUpdated$ = this.profileUpdatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  getProfile(): Observable<ProfilDto> {
    return this.http.get<ProfilDto>(`${environment.apiUrl}/api/profile`);
  }

  updateProfile(updateDTO: ProfileUpdateDTO): Observable<ProfilDto> {
    return this.http.put<ProfilDto>(`${environment.apiUrl}/api/profile`, updateDTO);
  }

  uploadProfileImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${environment.apiUrl}/api/profile/image`, formData);
  }

  notifyProfileUpdate(profile: ProfilDto): void {
    this.profileUpdatedSubject.next(profile);
  }
}