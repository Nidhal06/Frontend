import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { ProfilDto, ProfileUpdateDTO } from '../types/entities';
import { Observable, BehaviorSubject } from 'rxjs';

/**
 * Service for handling user profile operations
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly baseUrl = `${environment.apiUrl}/api/profile`;
  private profileUpdatedSubject = new BehaviorSubject<ProfilDto | null>(null);
  
  // Observable to track profile updates
  profileUpdated$ = this.profileUpdatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Get current user profile
   * @returns Observable of ProfilDto
   */
  getProfile(): Observable<ProfilDto> {
    return this.http.get<ProfilDto>(this.baseUrl);
  }

  /**
   * Update user profile
   * @param updateDTO Profile update data
   * @returns Observable of updated ProfilDto
   */
  updateProfile(updateDTO: ProfileUpdateDTO): Observable<ProfilDto> {
    return this.http.put<ProfilDto>(this.baseUrl, updateDTO);
  }

  /**
   * Upload profile image
   * @param file Image file
   * @returns Observable of image URL string
   */
  uploadProfileImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.baseUrl}/image`, formData);
  }

  /**
   * Notify subscribers of profile update
   * @param profile Updated profile data
   */
  notifyProfileUpdate(profile: ProfilDto): void {
    this.profileUpdatedSubject.next(profile);
  }
}