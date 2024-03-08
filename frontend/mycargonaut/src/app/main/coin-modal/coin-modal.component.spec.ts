import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinModalComponent } from './coin-modal.component';

describe('CoinModalComponent', () => {
  let component: CoinModalComponent;
  let fixture: ComponentFixture<CoinModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoinModalComponent]
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
    expect(component.coinAmount).not.toEqual(5);
  });

});
