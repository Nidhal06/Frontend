// team-invite-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventService } from 'src/app/services/event.service';
import { AuthService } from 'src/app/services/auth.service';
import { TeamMember } from 'src/app/services/team.model';
import { TeamService ,  } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-invite-dialog',
  templateUrl: './team-invite-dialog.component.html',
  styleUrls: ['./team-invite-dialog.component.css']
})
export class TeamInviteDialogComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  selectedMembers: number[] = [];
  isLoading = false;
  eventId: number;
  companyId: number;

  constructor(
    private eventService: EventService,
    private teamService: TeamService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<TeamInviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.eventId = data.eventId;
    this.companyId = this.authService.getCurrentUser()?.id;
  }

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.isLoading = true;
    this.teamService.getTeamMembers(this.companyId).subscribe({
      next: (members) => {
        this.teamMembers = members;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading team members:', err);
        this.isLoading = false;
      }
    });
  }

  toggleSelection(memberId: number): void {
    const index = this.selectedMembers.indexOf(memberId);
    if (index === -1) {
      this.selectedMembers.push(memberId);
    } else {
      this.selectedMembers.splice(index, 1);
    }
  }

  submitInvitations(): void {
    if (this.selectedMembers.length === 0) {
      return;
    }

    this.isLoading = true;
    this.eventService.registerTeamToEvent(this.eventId, this.companyId, this.selectedMembers).subscribe({
      next: (event) => {
        this.dialogRef.close(event);
      },
      error: (err) => {
        console.error('Error registering team:', err);
        this.isLoading = false;
      }
    });
  }
}