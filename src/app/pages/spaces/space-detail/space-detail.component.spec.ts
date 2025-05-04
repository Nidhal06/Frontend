import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceDetailComponent } from './space-detail.component';

describe('SpaceDetailComponent', () => {
  let component: SpaceDetailComponent;
  let fixture: ComponentFixture<SpaceDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpaceDetailComponent]
    });
    fixture = TestBed.createComponent(SpaceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
