import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NavbarComponent } from './navbar.component';
import {ComponentFixture, TestBed} from "@angular/core/testing";

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [NavbarComponent]
    });
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have isLogin property initially set to false', () => {
    expect(component.isLogin).toBe(false);
  });

  it('should have coins property initially set to -1', () => {
    expect(component.coins).toBe(-1);
  });


  it('should have a coins property', () => {
    // eslint-disable-next-line
    expect(component.hasOwnProperty('coins')).toBe(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
