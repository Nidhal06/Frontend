import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateSpacesComponent } from './private-spaces.component';

describe('PrivateSpacesComponent', () => {
  let component: PrivateSpacesComponent;
  let fixture: ComponentFixture<PrivateSpacesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrivateSpacesComponent]
    });
    fixture = TestBed.createComponent(PrivateSpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
