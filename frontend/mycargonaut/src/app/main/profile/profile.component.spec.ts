import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [HttpClientTestingModule, RouterModule, RouterTestingModule],
    });
  
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  
    component.userData = {
      firstName: 'Max',
      lastName: 'Mustermann',
      birthdate: '01.01.2000',
      description: 'Beschreibung',
      experience: 'Erfahrung'
    };
    localStorage.setItem('userData','{"email":"mails@mails.de","user_id":4}');
    component.vehicleData = [{name: 'Car1'}, {name: 'Car2'}];
    component.vehiclesAvailable = true;

    component.offerData = [{startLocation: 'Berlin', endLocation: 'Hamburg', startDate: '01.01.2024'}];
    component.offersAvailable = true;

    component.wantedData = [{startLocation: 'Hamburg', endLocation: 'Berlin', startDate: '02.02.2024'}, {startLocation: 'München', endLocation: 'Frankfurt', startDate: '03.03.2024'}];
    component.wantedsAvailable = true;

    component.uotData = [{startLocation: 'Köln', endLocation: 'Düsseldorf', startDate: '04.04.2023'}];
    component.uwtData = [{startLocation: 'Stuttgart', endLocation: 'Dresden', startDate: '05.05.2023'}];
    component.tripsAvailable = true;

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

it('should have correct background color for plus button', () => {
  const button = fixture.debugElement.query(By.css('.bi-plus-circle-fill'));
  expect(getComputedStyle(button.nativeElement).fill).toEqual('rgb(0, 91, 82)');
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

// Test muss angepasst werden wenn Algorithmus für Erfahrung implementiert wurde
it('should update progress bar width based on tripCount', () => {
  component.tripCount = 5;
  fixture.detectChanges();

  const progressBar = fixture.debugElement.query(By.css('.progress-bar'));

  const expectedWidth = (component.tripCount / 10) * 100 + '%';

  expect(progressBar.styles['width']).toBe(expectedWidth);
});

it('should display vehicles if vehicles are available', () => {

  const vehic = fixture.debugElement.query(By.css('.vehicles')).nativeElement.textContent.trim();

  expect(vehic).toBe('Car1  Car2');
});

it('should display [keine Fahrzeuge vorhanden] if no vehicles are available', () => {
  component.vehicleData = [];
  component.vehiclesAvailable = false;
  fixture.detectChanges();

  const vehic = fixture.debugElement.query(By.css('.vehicles')).nativeElement.textContent.trim();

  expect(vehic).toBe('Keine Fahrzeuge vorhanden');
});

it('should display offers if offers are available', () => {

  const offer = fixture.debugElement.query(By.css('.offer')).nativeElement.textContent.trim();

  expect(offer).toBe('Biete Fahrt von Berlin nach Hamburg am 01.01.2024');
});

it('should display [keine Angebote vorhanden] if no offers are available', () => {
  component.offerData = [];
  component.offersAvailable = false;
  fixture.detectChanges();

  const offer = fixture.debugElement.query(By.css('.offer')).nativeElement.textContent.trim();

  expect(offer).toBe('Keine Angebote vorhanden');
});

it('should display wanteds if wanteds are available', () => {

  const wanted = fixture.debugElement.query(By.css('.wanted')).nativeElement.textContent.trim();

  expect(wanted).toBe('Suche Fahrt von Hamburg nach Berlin am 02.02.2024  Suche Fahrt von München nach Frankfurt am 03.03.2024');
});

it('should display [keine Gesuche vorhanden] if no wanteds are available', () => {
  component.wantedData = [];
  component.wantedsAvailable = false;
  fixture.detectChanges();

  const wanted = fixture.debugElement.query(By.css('.wanted')).nativeElement.textContent.trim();

  expect(wanted).toBe('Keine Gesuche vorhanden');
});

it('should display trips if trips are available', () => {

  const wanted = fixture.debugElement.query(By.css('.trip')).nativeElement.textContent.trim();

  expect(wanted).toBe('Suche Fahrt von Stuttgart nach Dresden am 05.05.2023  Biete Fahrt von Köln nach Düsseldorf am 04.04.2023');
});

it('should display [keine Fahrten vorhanden] if no trips are available', () => {
  component.uotData = [];
  component.uwtData = [];
  component.tripsAvailable = false;
  fixture.detectChanges();

  const trip = fixture.debugElement.query(By.css('.trip')).nativeElement.textContent.trim();

  expect(trip).toBe('Keine Fahrten vorhanden');
});


  afterEach(() => {
    localStorage.clear();
  });
});


