import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { UserDTO } from '../types/entities';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

/**
 * Service for managing users.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }

  /**
   * Gets all users.
   * @returns Observable of UserDTO array.
   */
  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(
      `${environment.apiUrl}/api/users`, 
      { headers: this.authService.getAuthHeaders() }
    );
  }

  /**
   * Gets a user by ID.
   * @param id The user ID.
   * @returns Observable of UserDTO.
   */
  getUserById(id: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(
      `${environment.apiUrl}/api/users/${id}`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  /**
   * Creates a new user.
   * @param user The user data.
   * @returns Observable of the created UserDTO.
   */
  createUser(user: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(
      `${environment.apiUrl}/api/users`, 
      user
    );
  }

  /**
   * Updates an existing user.
   * @param id The user ID.
   * @param user The updated user data.
   * @returns Observable of the updated UserDTO.
   */
  updateUser(id: number, user: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(
      `${environment.apiUrl}/api/users/${id}`, 
      user
    );
  }

  /**
   * Toggles user status (active/inactive).
   * @param id The user ID.
   * @returns Observable of the updated UserDTO.
   */
  toggleUserStatus(id: number): Observable<UserDTO> {
    return this.http.patch<UserDTO>(
      `${environment.apiUrl}/api/users/${id}/toggle-status`, 
      {}
    );
  }

  /**
   * Deletes a user.
   * @param id The user ID.
   * @returns Observable of void.
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/api/users/${id}`
    );
  }
}