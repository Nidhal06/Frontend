import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnavailabilityManagementComponent } from './unavailability-management.component';

describe('UnavailabilityManagementComponent', () => {
  let component: UnavailabilityManagementComponent;
  let fixture: ComponentFixture<UnavailabilityManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnavailabilityManagementComponent]
    });
    fixture = TestBed.createComponent(UnavailabilityManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
