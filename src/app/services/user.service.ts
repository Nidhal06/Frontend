
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../services/environments/environment';
import { UserDTO } from '../types/entities';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${environment.apiUrl}/api/users`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getUserById(id: number): Observable<UserDTO> {
  return this.http.get<UserDTO>(
    `${environment.apiUrl}/api/users/${id}`,
    { headers: this.authService.getAuthHeaders() }
  );
}

  createUser(user: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${environment.apiUrl}/api/users`, user);
  }

  updateUser(id: number, user: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${environment.apiUrl}/api/users/${id}`, user);
  }

  toggleUserStatus(id: number): Observable<UserDTO> {
    return this.http.patch<UserDTO>(`${environment.apiUrl}/api/users/${id}/toggle-status`, {});
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/users/${id}`);
  }
}