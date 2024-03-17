import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdComponent } from './ad.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatComponent } from "../../chat/chat.component";
import { AuthModule } from 'src/app/auth/auth.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {FormsModule} from "@angular/forms";

describe('AdComponent', () => {
  let component: AdComponent;
  let fixture: ComponentFixture<AdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdComponent, ChatComponent],
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule, AuthModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AdComponent);
    component = fixture.componentInstance;


    localStorage.setItem('userData','{"email":"mails@mails.de","user_id":4}');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
