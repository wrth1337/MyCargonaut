import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateOfferComponent } from './create-offer.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateOfferComponent', () => {
  let component: CreateOfferComponent;
  let fixture: ComponentFixture<CreateOfferComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, RouterModule, RouterTestingModule,],
      declarations: [CreateOfferComponent]
    });
    fixture = TestBed.createComponent(CreateOfferComponent);
    component = fixture.componentInstance;
    component.userData = {
      firstName: 'Max',
      lastName: 'Mustermann',
      birthdate: '01.01.2000',
      description: 'Beschreibung',
      experience: 'Erfahrung'
    };
    localStorage.setItem('userData','{"email":"mails@mails.de","user_id":4}');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
