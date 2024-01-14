import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdCardComponent } from './ad-card.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

describe('AdCardComponent', () => {
  let component: AdCardComponent;
  let fixture: ComponentFixture<AdCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule],
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
