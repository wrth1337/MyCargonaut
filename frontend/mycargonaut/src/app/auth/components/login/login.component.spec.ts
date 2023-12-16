import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, FormsModule, RouterModule, RouterTestingModule],
      declarations: [LoginComponent]
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have an email input field with type text', () => {
    const el = fixture.debugElement.query(By.css('.email-input'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('type')).toEqual('text');
  })
  it('should have a password input field with type password', () => {
    const el = fixture.debugElement.query(By.css('.password-input'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('type')).toEqual('password');
  })
  it('should have a button with value Anmelden and color #1D8F83', () => {
    const el = fixture.debugElement.query(By.css('.submitButton'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('value')).toEqual('Anmelden');
    expect(getComputedStyle(el.nativeElement).backgroundColor).toEqual('rgb(29, 143, 131)')
  })
  it('should have the myCargonaut logo and to have alt text', () => {
    const el = fixture.debugElement.query(By.css('.logo'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('alt')).toEqual('Unser Logo: MyCargonaut');
  })
});
