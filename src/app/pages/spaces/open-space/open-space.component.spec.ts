import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenSpaceComponent } from './open-space.component';

describe('OpenSpaceComponent', () => {
  let component: OpenSpaceComponent;
  let fixture: ComponentFixture<OpenSpaceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenSpaceComponent]
    });
    fixture = TestBed.createComponent(OpenSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
