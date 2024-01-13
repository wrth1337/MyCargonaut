import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultpageComponent } from './resultpage.component';

describe('ResultpageComponent', () => {
  let component: ResultpageComponent;
  let fixture: ComponentFixture<ResultpageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResultpageComponent]
    });
    fixture = TestBed.createComponent(ResultpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
