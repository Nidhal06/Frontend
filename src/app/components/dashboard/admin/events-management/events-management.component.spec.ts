import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsManagementComponent } from './events-management.component';

describe('EventsManagementComponent', () => {
  let component: EventsManagementComponent;
  let fixture: ComponentFixture<EventsManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventsManagementComponent]
    });
    fixture = TestBed.createComponent(EventsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
