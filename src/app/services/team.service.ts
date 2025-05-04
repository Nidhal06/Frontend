import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environments/environment';
import { Team , TeamMember } from './team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/api/company/teams`;

  constructor(private http: HttpClient) { }

  getTeamMembers(companyId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/${companyId}/members`);
  }

  getTeams(companyId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}?companyId=${companyId}`);
  }
}