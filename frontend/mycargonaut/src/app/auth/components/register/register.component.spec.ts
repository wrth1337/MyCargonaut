import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {By} from "@angular/platform-browser";

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule],
      declarations: [RegisterComponent]
    });
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a firstName input field with type=text', () =>{
    const el = fixture.debugElement.query(By.css('.firstName-input'));
    expect(el.nativeElement.getAttribute('type')).toEqual('text');
  });

  it('should have a lastName input field with type=text', () =>{
    const el = fixture.debugElement.query(By.css('.lastName-input'));
    expect(el.nativeElement.getAttribute('type')).toEqual('text');
  });

  it('should have a birthdate input field with type=date', () =>{
    const el = fixture.debugElement.query(By.css('.birthdate-input'));
    expect(el.nativeElement.getAttribute('type')).toEqual('date');
  });

  it('should have a phonenumber input field with type=tel', () =>{
    const el = fixture.debugElement.query(By.css('.phonenumber-input'));
    expect(el.nativeElement.getAttribute('type')).toEqual('tel');
  });

  it('should have a email input field with type=text', () =>{
    const el = fixture.debugElement.query(By.css('.email-input'));
    expect(el.nativeElement.getAttribute('type')).toEqual('text');
  });

  it('should have a password input field with type=password', () =>{
    const el = fixture.debugElement.query(By.css('.password-input'));
    expect(el.nativeElement.getAttribute('type')).toEqual('password');
  });

  it('should have a password input field for a repeating password with type=password', () =>{
    const el = fixture.debugElement.query(By.css('.passwordRepeat-input'));
    expect(el.nativeElement.getAttribute('type')).toEqual('password');
  });
});
