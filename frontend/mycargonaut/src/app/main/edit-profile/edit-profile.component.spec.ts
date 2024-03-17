import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProfileComponent } from './edit-profile.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditProfileComponent', () => {
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditProfileComponent],
      imports: [HttpClientTestingModule, FormsModule, RouterModule, RouterTestingModule],
    });
  
    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
  
    component.userData = {
      firstName: 'Max',
      lastName: 'Mustermann',
      birthdate: '01.01.2000',
      description: 'Beschreibung',
      experience: 'Erfahrung',
      picture: 'URL_DES_PROFILBILDS'
    };
    localStorage.setItem('userData','{"email":"mails@mails.de","user_id":4}');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name', () => {  
    
    const el = fixture.debugElement.query(By.css('.username')).nativeElement.textContent.trim();
    expect(el).toBe('Max Mustermann');
  });

  it('should have birthdate input with type = date when editBirth is true', () => {
    component.editBirth = true;
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.form-control-birthdate'));
    expect(el.nativeElement.getAttribute('type')).toBe('date');
  });

  it('should display correctly formatted birthdate when editBirth is false', () => {
    component.editBirth = false;
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.birthdate')).nativeElement.textContent.trim();
    expect(el).toBe('01.01.2000');
  });

  it('should display [Daten erfolgreich aktualisiert] when changing profile data successfully', () => {  
    component.success = true;
    component.showFlashMessage = true;
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.flashmessage')).nativeElement.textContent.trim();
    expect(el).toBe('Daten erfolgreich aktualisiert.');
  });

  it('should have the correct color for the upload button', () => {
    const el = fixture.debugElement.query(By.css('#pbModal .uploadButton .bi-image'));
    const color = window.getComputedStyle(el.nativeElement).fill;
    expect(color).toBe('rgb(0, 91, 82)');
  });

  it('should have the correct text for the upload button', () => {
    const el = fixture.debugElement.query(By.css('#pbModal .uploadButton .upload .col.center')).nativeElement.textContent.trim();
    expect(el).toBe('Bild hochladen');
  });
  
  it('should display placeholder when no profile picture is available', () => {
    component.userData = {
      firstName: 'Max',
      lastName: 'Mustermann',
      birthdate: '01.01.2000',
      description: 'Beschreibung',
      experience: 'Erfahrung',
      picture: ''
    };
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.bi-person-circle'));
    expect(el).toBeTruthy();

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
    
    expect(stars.length).toBe(5);
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
    
    expect(stars.length).toBe(5);
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
    
    expect(stars.length).toBe(5);
    expect(stars[0].classes['highlight']).toBeTruthy();
    expect(stars[1].classes['highlight']).toBeTruthy();
    expect(stars[2].classes['highlight']).toBeTruthy();
    expect(stars[3].classes['highlight']).toBeFalsy();
    expect(stars[4].classes['highlight']).toBeFalsy();
  });

  it('should have correct background color for edit button', () => {
    const button = fixture.debugElement.query(By.css('.bi-pencil-square'));
    expect(getComputedStyle(button.nativeElement).fill).toEqual('rgb(0, 91, 82)');
  });

  it('should have correct background color for submit button', () => {
    const button = fixture.debugElement.query(By.css('.submitButton'));
    expect(getComputedStyle(button.nativeElement).backgroundColor).toEqual('rgb(0, 91, 82)');
  });

  it('should have correct background color for back button', () => {
    const button = fixture.debugElement.query(By.css('.bi-arrow-left-circle-fill'));
    expect(getComputedStyle(button.nativeElement).fill).toEqual('rgb(0, 91, 82)');
  });

  it('should have correct color for card outline', () => {
    const button = fixture.debugElement.query(By.css('.card'));
    expect(getComputedStyle(button.nativeElement).borderColor).toEqual('rgb(0, 91, 82)');
  });

  it('should have correct color for progressbar', () => {
    const bar = fixture.debugElement.query(By.css('.progress'));
    expect(getComputedStyle(bar.nativeElement).backgroundColor).toEqual('rgb(225, 233, 190)');
  });

  it('should have correct color for progress', () => {
    const bar = fixture.debugElement.query(By.css('.custom-progress'));
    expect(getComputedStyle(bar.nativeElement).backgroundColor).toEqual('rgb(0, 91, 82)');
  });

  afterEach(() => {
    localStorage.clear();
  });
});
