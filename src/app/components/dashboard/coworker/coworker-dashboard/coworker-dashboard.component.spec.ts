import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoworkerDashboardComponent } from './coworker-dashboard.component';

describe('CoworkerDashboardComponent', () => {
  let component: CoworkerDashboardComponent;
  let fixture: ComponentFixture<CoworkerDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoworkerDashboardComponent]
    });
    fixture = TestBed.createComponent(CoworkerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
