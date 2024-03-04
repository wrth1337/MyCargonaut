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
