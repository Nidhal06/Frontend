import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionisteDashboardComponent } from './receptioniste-dashboard.component';

describe('ReceptionisteDashboardComponent', () => {
  let component: ReceptionisteDashboardComponent;
  let fixture: ComponentFixture<ReceptionisteDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceptionisteDashboardComponent]
    });
    fixture = TestBed.createComponent(ReceptionisteDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
