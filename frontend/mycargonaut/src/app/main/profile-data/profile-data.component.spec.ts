import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileDataComponent } from './profile-data.component';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProfileDataComponent', () => {
  let component: ProfileDataComponent;
  let fixture: ComponentFixture<ProfileDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileDataComponent],
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
    });
    fixture = TestBed.createComponent(ProfileDataComponent);
    component = fixture.componentInstance;
    component.userData = {
      firstName: 'Max',
      lastName: 'Mustermann',
      birthdate: '01.01.2000',
      picture: 'URL_DES_PROFILBILDS',
      description: 'Beschreibung',
      experience: 'Erfahrung'
    };
    localStorage.setItem('userData','{"email":"mails@mails.de","user_id":1}');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display profile picture when available', () => {
    const el = fixture.debugElement.query(By.css('.profilepicture'));
    const placeholder = fixture.debugElement.query(By.css('.bi-person-circle'));
    expect(placeholder).toBeFalsy();
    expect(el.nativeElement.getAttribute('src')).toEqual('URL_DES_PROFILBILDS');
  });

  it('should highlight 4 stars for the rating', () => {
    component.rating = 4;
    fixture.detectChanges();
    const stars = fixture.debugElement.queryAll(By.css('.star'));

    expect(stars[0].classes['highlight']).toBeTruthy();
    expect(stars[1].classes['highlight']).toBeTruthy();
    expect(stars[2].classes['highlight']).toBeTruthy();
    expect(stars[3].classes['highlight']).toBeTruthy();
    expect(stars[4].classes['highlight']).toBeFalsy();
  });

  it('should highlight 5 stars for the rating', () => {
    component.rating = 5;
    fixture.detectChanges();
    const stars = fixture.debugElement.queryAll(By.css('.star'));

    expect(stars[0].classes['highlight']).toBeTruthy();
    expect(stars[1].classes['highlight']).toBeTruthy();
    expect(stars[2].classes['highlight']).toBeTruthy();
    expect(stars[3].classes['highlight']).toBeTruthy();
    expect(stars[4].classes['highlight']).toBeTruthy();
  });

  it('should highlight 3 stars for the rating', () => {
    component.rating = 3;
    fixture.detectChanges();
    const stars = fixture.debugElement.queryAll(By.css('.star'));

    expect(stars[0].classes['highlight']).toBeTruthy();
    expect(stars[1].classes['highlight']).toBeTruthy();
    expect(stars[2].classes['highlight']).toBeTruthy();
    expect(stars[3].classes['highlight']).toBeFalsy();
    expect(stars[4].classes['highlight']).toBeFalsy();
  });

  it('should have correct color for progressbar', () => {
    const bar = fixture.debugElement.query(By.css('.progress'));
    expect(getComputedStyle(bar.nativeElement).backgroundColor).toEqual('rgb(225, 233, 190)');
  });

  it('should have correct color for progress', () => {
    const bar = fixture.debugElement.query(By.css('.custom-progress'));
    expect(getComputedStyle(bar.nativeElement).backgroundColor).toEqual('rgb(0, 91, 82)');
  });
});
