import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultpageComponent } from './resultpage.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SearchbarComponent} from "../searchbar/searchbar.component";

describe('ResultpageComponent', () => {
  let component: ResultpageComponent;
  let fixture: ComponentFixture<ResultpageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule],
      declarations: [ResultpageComponent, SearchbarComponent]
    });
    fixture = TestBed.createComponent(ResultpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
