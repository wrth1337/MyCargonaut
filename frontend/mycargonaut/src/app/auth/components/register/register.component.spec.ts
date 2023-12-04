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

  it('should have a username input field with type=text', () =>{
    const el = fixture.debugElement.query(By.css('.username-input'));
    expect(el.nativeElement.getAttribute('type')).toEqual('text');
  });

  it('should have a password input field with type=password', () =>{
    const el = fixture.debugElement.query(By.css('.password-input'));
    expect(el.nativeElement.getAttribute('type')).toEqual('password');
  });
});
