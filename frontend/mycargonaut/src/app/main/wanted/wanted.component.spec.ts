import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { WantedComponent } from './wanted.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';

describe('WantedComponent', () => {
  let component: WantedComponent;
  let fixture: ComponentFixture<WantedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WantedComponent],
      imports: [HttpClientTestingModule, RouterModule, RouterTestingModule, FormsModule]
    });
    fixture = TestBed.createComponent(WantedComponent);
    component = fixture.componentInstance;

    component.userData = {
      firstName: 'Max',
      lastName: 'Mustermann',
      birthdate: '01.01.2000',
      description: 'Beschreibung',
      experience: 'Erfahrung'
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

  it('should display short description', () => {
  
    const el = fixture.debugElement.query(By.css('.description')).nativeElement.textContent.trim();
    expect(el).toBe('Beschreibung');
  });

  it('should display [Gesuch erfolgreich erstellt] when submitting a new wanted ad successfully', () => {  
    component.success = true;
    component.showFlashMessage = true;
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.flashmessage')).nativeElement.textContent.trim();
    expect(el).toBe('Gesuch erfolgreich erstellt.');
  });

  
  it('should display placeholder when no profile picture is available', () => {
    const el = fixture.debugElement.query(By.css('.bi-person-circle'));
    expect(el).toBeTruthy();

  });
  
  it('should display profile picture when available', () => {
  
    component.userData = { picture: 'URL_DES_PROFILBILDS' };
    fixture.detectChanges();
    
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

  it('should have correct background color for edit button', () => {
    const button = fixture.debugElement.query(By.css('.editButton'));
    expect(getComputedStyle(button.nativeElement).backgroundColor).toEqual('rgb(0, 91, 82)');
  });

  it('should have correct background color for submit button', () => {
    const button = fixture.debugElement.query(By.css('.submitButton'));
    expect(getComputedStyle(button.nativeElement).backgroundColor).toEqual('rgb(0, 91, 82)');
  });

  it('should have correct background color for confirm button', () => {
    const button = fixture.debugElement.query(By.css('.okButton'));
    expect(getComputedStyle(button.nativeElement).backgroundColor).toEqual('rgb(0, 91, 82)');
  });

  it('should have correct color for card outline', () => {
    const button = fixture.debugElement.query(By.css('.card'));
    expect(getComputedStyle(button.nativeElement).borderColor).toEqual('rgb(0, 91, 82)');
  });

  it('should have input field startLocation with type text', () => {
    const el = fixture.debugElement.query(By.css('.startLoc-input'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('type')).toEqual('text');
  });

  it('should have correct color for progressbar', () => {
    const bar = fixture.debugElement.query(By.css('.progress'));
    expect(getComputedStyle(bar.nativeElement).backgroundColor).toEqual('rgb(225, 233, 190)');
  });

  it('should have correct color for progress', () => {
    const bar = fixture.debugElement.query(By.css('.custom-progress'));
    expect(getComputedStyle(bar.nativeElement).backgroundColor).toEqual('rgb(0, 91, 82)');
  });

  it('should have input field startLocation with type text', () => {
    const el = fixture.debugElement.query(By.css('.startLoc-input'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('type')).toEqual('text');
  });

  it('should have input field endLocation with type text', () => {
    const el = fixture.debugElement.query(By.css('.endLoc-input'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('type')).toEqual('text');
  });

  it('should have input field startDate with type date', () => {
    const el = fixture.debugElement.query(By.css('.startDate-input'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('type')).toEqual('date');
  });

  it('should have input field freight with type text', () => {
    const el = fixture.debugElement.query(By.css('.freight-input'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('type')).toEqual('text');
  });

  it('should have input field number of seats with type number', () => {
    const el = fixture.debugElement.query(By.css('.numSeats-input'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('type')).toEqual('number');
  });

  it('should show the correct icons for pets', () => {
    component.pet = true;
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.pets'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('src')).toEqual('../../../assets/icons/walking-dog-sign-svgrepo-com.svg');
  });

  it('should show the correct icons for smoke', () => {
    component.smoke = false;
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.smokefree'));
    expect(el).toBeTruthy();
    expect(el.nativeElement.getAttribute('src')).toEqual('../../../assets/icons/smoke-free-svgrepo-com.svg');
  });

  afterEach(() => {
    localStorage.clear();
  });
});
