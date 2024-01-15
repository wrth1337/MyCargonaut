import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateOfferComponent } from './create-offer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";

describe('CreateOfferComponent', () => {
  let component: CreateOfferComponent;
  let fixture: ComponentFixture<CreateOfferComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, RouterModule, ],
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
