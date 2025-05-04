import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpacesManagementComponent } from './spaces-management.component';

describe('SpacesManagementComponent', () => {
  let component: SpacesManagementComponent;
  let fixture: ComponentFixture<SpacesManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpacesManagementComponent]
    });
    fixture = TestBed.createComponent(SpacesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
