import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoinModalComponent } from './coin-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {RouterModule} from "@angular/router";
import {RouterTestingModule} from "@angular/router/testing";
import {FormsModule} from "@angular/forms";

describe('CoinModalComponent', () => {
  let component: CoinModalComponent;
  let fixture: ComponentFixture<CoinModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoinModalComponent],
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
    });
    fixture = TestBed.createComponent(CoinModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have addCoins method', () => {
    expect(component.addCoins).toBeTruthy();
  });

  it('should change coinAmount when addCoins is called', () => {
    component.coinAmount = 5;
    component.addCoins();
    expect(component.coinAmount).toEqual(5);
  });

});
