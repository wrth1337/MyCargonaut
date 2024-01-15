import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateOfferComponent } from './create-offer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ApiService} from "src/app/service/api.service";

describe('CreateOfferComponent', () => {
  let component: CreateOfferComponent;
  let fixture: ComponentFixture<CreateOfferComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NgForm, ApiService, DatePipe],
      declarations: [CreateOfferComponent]
    });
    fixture = TestBed.createComponent(CreateOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
