import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WantedComponent } from './wanted.component';

describe('WantedComponent', () => {
  let component: WantedComponent;
  let fixture: ComponentFixture<WantedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WantedComponent]
    });
    fixture = TestBed.createComponent(WantedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
