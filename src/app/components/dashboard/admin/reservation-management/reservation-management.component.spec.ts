import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationManagementComponent } from './reservation-management.component';

describe('ReservationManagementComponent', () => {
  let component: ReservationManagementComponent;
  let fixture: ComponentFixture<ReservationManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReservationManagementComponent]
    });
    fixture = TestBed.createComponent(ReservationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
