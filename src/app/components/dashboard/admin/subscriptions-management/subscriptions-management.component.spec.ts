import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionsManagementComponent } from './subscriptions-management.component';

describe('SubscriptionsManagementComponent', () => {
  let component: SubscriptionsManagementComponent;
  let fixture: ComponentFixture<SubscriptionsManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubscriptionsManagementComponent]
    });
    fixture = TestBed.createComponent(SubscriptionsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
