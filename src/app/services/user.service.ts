import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError , map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from './environments/environment';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImagePath: string;
  roles: string[];
  type: string;
  enabled: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/admin/users`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

createUser(userData: any): Observable<User> {
  return this.http.post<User>(this.apiUrl, userData, { 
    headers: this.getHeaders(),
    observe: 'response'
  }).pipe(
    map(response => {
      if (!response.body) {
        throw new Error('No response body received');
      }
      return response.body;
    }),
    catchError(error => {
      console.error('Create user error details:', error);
      
      let errorMessage = 'An error occurred while creating the user';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return throwError(() => new Error(errorMessage));
    })
  );
}

  updateUser(id: number, userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData, { 
      headers: this.getHeaders(),
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('No response body received');
        }
        return response.body;
      }),
      catchError(error => {
        console.error('Update error details:', error);
        
        let errorMessage = 'An error occurred while updating the user';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  toggleUserStatus(id: number): Observable<User> {
    return this.http.patch<User>(
      `${this.apiUrl}/${id}/toggle-status`, 
      {}, 
      { 
        headers: this.getHeaders(),
        observe: 'response'
      }
    ).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('No response body received');
        }
        return response.body;
      }),
      catchError(error => {
        console.error('Toggle status error:', error);
        
        let errorMessage = 'Error changing user status';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders(),
      observe: 'response'
    }).pipe(catchError(this.handleError));
  }
}