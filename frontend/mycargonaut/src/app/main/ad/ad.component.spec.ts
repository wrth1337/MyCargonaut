import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdComponent } from './ad.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('AdComponent', () => {
  let component: AdComponent;
  let fixture: ComponentFixture<AdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdComponent],
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
    });
    fixture = TestBed.createComponent(AdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
