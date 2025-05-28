import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenSpaceDetailComponent } from './open-space-detail.component';

describe('OpenSpaceDetailComponent', () => {
  let component: OpenSpaceDetailComponent;
  let fixture: ComponentFixture<OpenSpaceDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenSpaceDetailComponent]
    });
    fixture = TestBed.createComponent(OpenSpaceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
