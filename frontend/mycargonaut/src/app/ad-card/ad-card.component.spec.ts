import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdCardComponent } from './ad-card.component';

describe('AdCardComponent', () => {
  let component: AdCardComponent;
  let fixture: ComponentFixture<AdCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdCardComponent]
    });
    fixture = TestBed.createComponent(AdCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
