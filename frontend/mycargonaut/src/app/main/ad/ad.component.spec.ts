import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdComponent } from './ad.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatComponent } from "../../chat/chat.component";
import { ProfileDataComponent } from '../profile-data/profile-data.component';
import { AuthModule } from 'src/app/auth/auth.module';

describe('AdComponent', () => {
  let component: AdComponent;
  let fixture: ComponentFixture<AdComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdComponent, ChatComponent, ProfileDataComponent],
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule, AuthModule],
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
