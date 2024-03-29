import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [HttpClientTestingModule, RouterModule, RouterTestingModule, FormsModule],
    });

    fixture = TestBed.createComponent(ProfileComponent);
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
    component.vehicleData = [{name: 'Car1'}, {name: 'Car2'}];
    component.vehiclesAvailable = true;

    component.offerData = [{startLocation: 'Berlin', endLocation: 'Hamburg', startDate: '01.01.2024'}];
    component.offersAvailable = true;

    component.wantedData = [{startLocation: 'Hamburg', endLocation: 'Berlin', startDate: '02.02.2024'}, {startLocation: 'München', endLocation: 'Frankfurt', startDate: '03.03.2024'}];
    component.wantedsAvailable = true;

    component.tripData = [{startLocation: 'Stuttgart', endLocation: 'Dresden', startDate: '05.05.2023'}, {startLocation: 'Köln', endLocation: 'Düsseldorf', startDate: '04.04.2023'}];
    component.tripsAvailable = true;

    component.language = [
      { id: 1, name: 'german', icon: '../../../assets/icons/flag-for-flag-germany-svgrepo-com.svg' },
      { id: 2, name: 'english', icon: '../../../assets/icons/flag-for-flag-united-kingdom-svgrepo-com.svg' },
    ];

    component.languageVariables = {
      german: true,
      english: false,
    };
    component.isOwner = true;

    component.ratingData = [{ratingId: 1, bookingId: 1, userWhoIsEvaluating: 1, userWhoWasEvaluated: 2, punctuality: 4, agreement: 3, pleasent: 1, freight: 5, comment: 'Test Kommentar', firstName: 'Vorname', lastName: 'Nachname', picture: 'profilepicture.jpg'}];
    component.ratingsAvailable = true;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct stars for puncuality rating', () => {
    const stars = fixture.debugElement.queryAll(By.css('.punctuality'));
    expect(stars[0].classes['highlight']).toBeTruthy();
    expect(stars[1].classes['highlight']).toBeTruthy();
    expect(stars[2].classes['highlight']).toBeTruthy();
    expect(stars[3].classes['highlight']).toBeTruthy();
    expect(stars[4].classes['highlight']).toBeFalsy();
  });

  it('should display correct stars for agreement rating', () => {
    const stars = fixture.debugElement.queryAll(By.css('.agreement'));
    expect(stars[0].classes['highlight']).toBeTruthy();
    expect(stars[1].classes['highlight']).toBeTruthy();
    expect(stars[2].classes['highlight']).toBeTruthy();
    expect(stars[3].classes['highlight']).toBeFalsy();
    expect(stars[4].classes['highlight']).toBeFalsy();
  });

  it('should display correct stars for pleasent rating', () => {
    const stars = fixture.debugElement.queryAll(By.css('.pleasent'));
    expect(stars[0].classes['highlight']).toBeTruthy();
    expect(stars[1].classes['highlight']).toBeFalsy();
    expect(stars[2].classes['highlight']).toBeFalsy();
    expect(stars[3].classes['highlight']).toBeFalsy();
    expect(stars[4].classes['highlight']).toBeFalsy();
  });

  it('should display correct stars for freight rating', () => {
    const stars = fixture.debugElement.queryAll(By.css('.freight'));
    expect(stars[0].classes['highlight']).toBeTruthy();
    expect(stars[1].classes['highlight']).toBeTruthy();
    expect(stars[2].classes['highlight']).toBeTruthy();
    expect(stars[3].classes['highlight']).toBeTruthy();
    expect(stars[4].classes['highlight']).toBeTruthy();
  });

  it('should display the author of the rating', () => {
    const el = fixture.debugElement.query(By.css('.author')).nativeElement.textContent.trim();
    expect(el).toBe('Vorname Nachname');
  });

  it('should not display the add buttons and edit button when isOwner is false', () => {
    component.isOwner = false;
    fixture.detectChanges();
    const plus = fixture.debugElement.query(By.css('.plus'));
    const edit = fixture.debugElement.query(By.css('.edit'));
    expect(plus).toBeFalsy();
    expect(edit).toBeFalsy();
  });

  it('should display the add buttons and edit button when isOwner is true', () => {
    component.isOwner = true;
    fixture.detectChanges();
    const plus = fixture.debugElement.query(By.css('.plus'));
    const edit = fixture.debugElement.query(By.css('.edit'));
    expect(plus).toBeTruthy();
    expect(edit).toBeTruthy();
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
    const stars = fixture.debugElement.queryAll(By.css('.stars'));

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
  const stars = fixture.debugElement.queryAll(By.css('.stars'));

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
  const stars = fixture.debugElement.queryAll(By.css('.stars'));

  expect(stars.length).toBe(5);
  expect(stars[0].classes['highlight']).toBeTruthy();
  expect(stars[1].classes['highlight']).toBeTruthy();
  expect(stars[2].classes['highlight']).toBeTruthy();
  expect(stars[3].classes['highlight']).toBeFalsy();
  expect(stars[4].classes['highlight']).toBeFalsy();
});

it('should have correct background color for edit button', () => {
  component.isOwner = true;
  fixture.detectChanges();
  const button = fixture.debugElement.query(By.css('.bi-pencil-square'));
  expect(getComputedStyle(button.nativeElement).fill).toEqual('rgb(0, 91, 82)');
});

it('should have correct background color for plus button', () => {
  component.isOwner = true;
  fixture.detectChanges();
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

it('should update progress bar width based on xp', () => {
  component.xp = 70;
  fixture.detectChanges();

  const progressBar = fixture.debugElement.query(By.css('.progress-bar'));
  const level = fixture.debugElement.query(By.css('.progress-label')).nativeElement.textContent.trim();

  const expectedWidth = (component.xp) + '%';

  expect(progressBar.styles['width']).toBe(expectedWidth);
  expect(level).toBe('Level 1');
});

it('should display vehicles if vehicles are available', () => {

  const vehic = fixture.debugElement.query(By.css('.vehicles')).nativeElement.textContent.trim();
  expect(vehic).toEqual('Car1 Car2');
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

  expect(wanted).toBe('Fahrt von Stuttgart nach Dresden am 05.05.2023  Fahrt von Köln nach Düsseldorf am 04.04.2023');
});

it('should display [keine Fahrten vorhanden] if no trips are available', () => {
  component.tripData = [];
  component.tripsAvailable = false;
  fixture.detectChanges();

  const trip = fixture.debugElement.query(By.css('.trip')).nativeElement.textContent.trim();

  expect(trip).toBe('Keine Fahrten vorhanden');
});

it('should display correct language icons', () => {
  const langElements = fixture.debugElement.queryAll(By.css('.langs img'));
  expect(langElements.length).toBe(1);

  langElements.forEach((langElement, index) => {
    const lang = component.language[index];
    expect(langElement.nativeElement.getAttribute('alt')).toBe(lang.name);
    expect(langElement.nativeElement.getAttribute('src')).toBe(lang.icon);
  });
});

it('should have an input field name with type text', () => {
  const elem = fixture.debugElement.query(By.css('#name')).nativeElement;

  expect(elem.type).toBe('text');
});
it('should have an input field seats with type number', () => {
  const elem = fixture.debugElement.query(By.css('#seats')).nativeElement;

  expect(elem.type).toBe('number');
});
it('should have an input field weight with type text', () => {
  const elem = fixture.debugElement.query(By.css('#weight')).nativeElement;

  expect(elem.type).toBe('number');
});
it('should have an input field dimensions with type text', () => {
  const elem = fixture.debugElement.query(By.css('#dimensions')).nativeElement;

  expect(elem.type).toBe('text');
});
it('should set updateVehicle to true if a vehicle is clicked', () => {
  component.updateVehicle = false;
  component.isOwner = true;
  fixture.detectChanges();
  const elem = fixture.debugElement.query(By.css('.vehicleEntry')).nativeElement;
  elem.click();
  expect(component.updateVehicle).toBeTrue();
});

it('should set updateVehicle to false if the new vehicle button is clicked', () => {
  component.updateVehicle = true;
  component.isOwner = true;
  fixture.detectChanges();
  const elem = fixture.debugElement.query(By.css('.newVehicleButton')).nativeElement;
  elem.click();
  expect(component.updateVehicle).toBeFalse();
});

it('should display the delete Button if it updates an existing vehicle', () => {
  component.updateVehicle = true;
  fixture.detectChanges();

  const del = fixture.debugElement.query(By.css('#deleteButton'));

  expect(del).toBeTruthy();
});

it('should not display the delete Button if no vehicle to update was selected', () => {
  component.updateVehicle = false;
  fixture.detectChanges();

  const del = fixture.debugElement.query(By.css('#deleteButton'));

  expect(del).toBeNull();
});


  afterEach(() => {
    localStorage.clear();
  });
});


