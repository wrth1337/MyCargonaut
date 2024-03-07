import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Ad } from '../ad';
import {SearchbarComponent} from "../../searchbar/searchbar.component";
import {FormsModule} from "@angular/forms";

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule],
      declarations: [HomeComponent, SearchbarComponent]
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should write a correct title for an offer with intermediate goal', () => {
    const offer: Ad = {
      adId: 0,
      description: '',
      startLocation: 'Stadt A',
      endLocation: 'Stadt C',
      intermediateGoals: [{ intermediateGoalId: 1, location: 'City B', adId: 1 }],
      type: 'offer',
      startDate: new Date,
      endDate: new Date,
      animals: false,
      smoker: false,
      notes: '',
      numSeats: 0,
      active: false,
      userId: 0,
      state: ''
    };
    expect(component.writeTitle(offer)).toBe('Biete Fahrt von Stadt A über City B nach Stadt C')
  })
  it('should write a correct title for an wanted', () => {
    const offer: Ad = {
      adId: 0,
      description: '',
      startLocation: 'Stadt A',
      endLocation: 'Stadt B',
      intermediateGoals: [],
      type: 'wanted',
      startDate: new Date,
      endDate: new Date,
      animals: false,
      smoker: false,
      notes: '',
      numSeats: 0,
      active: false,
      userId: 0,
      state: ''
    };
    expect(component.writeTitle(offer)).toBe('Suche Fahrt von Stadt A nach Stadt B')
  })
  it('should update the index correctly', () => {
    component.index = 0;
    component.next();
    expect(component.index).toBe(1);
    for(let i = 0; i < 5; i++) component.next();
    expect(component.index).toBe(0);
    component.previous();
    expect(component.index).toBe(5);
    component.previous();
    expect(component.index).toBe(4);
  })
});
