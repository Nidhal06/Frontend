import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamInviteDialogComponent } from './team-invite-dialog.component';

describe('TeamInviteDialogComponent', () => {
  let component: TeamInviteDialogComponent;
  let fixture: ComponentFixture<TeamInviteDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamInviteDialogComponent]
    });
    fixture = TestBed.createComponent(TeamInviteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
