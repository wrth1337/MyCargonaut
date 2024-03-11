import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.css'],
  providers: [DatePipe]
})

export class CreateOfferComponent {

  constructor(
    private api: ApiService,
    private datePipe: DatePipe,
    private auth: AuthService
  ) {}

  userData: any;
  vehicleData: any;
  rating: any;
  smoke = true;
  pet = true;
  stars: number[] = [1, 2, 3, 4, 5];
  tripCount: any;
  vehiclesAvailable = false;
  definedVehicleId = null
  IsVehicleSelected = false;
  showFlashMessage = false;
  success = false;
  approved = false;
  selectedVehicleForOffer = {
    loadingAreaDimensions: null,
    maxWeight: null,
    name: null,
    numSeats: null,
    picture: null,
    specialFeatures: null,
    vehicleId: null,
  };
  language = [
    { id: 1, name: 'german', icon: '../../../assets/icons/flag-for-flag-germany-svgrepo-com.svg' },
    { id: 2, name: 'english', icon: '../../../assets/icons/flag-for-flag-united-kingdom-svgrepo-com.svg' },
  ];

  languageVariables: { [key: string]: boolean } = {
    german: false,
    english: false,
  }

  ngOnInit() {
    const userId = JSON.parse(this.auth.getUserData() || '{user_id = 0}').user_id;
    this.api.getRequest("profile/userdata/" + userId).subscribe((res: any) => {
      this.userData = res.userData;
      for (const lang of this.language) {
        this.languageVariables[lang.name] = false;
      }

      for (const langObj of res.languages) {
        const langVariable = this.language.find(lang => lang.id === langObj.languageId);
        if (langVariable) {
          this.languageVariables[langVariable.name] = true;
        }
      }
      this.rating = Math.round(res.userData.rating);
      this.userData.birthdate = this.datePipe.transform(res.userData.birthdate, 'dd.MM.yyyy');
    });
    this.api.getRequest("trip").subscribe((res: any) => {
      if(res != null) {
        this.tripCount = res.uwtData.length + res.uotData.length;
      }
      else {
        this.tripCount = 0;
      }
    });
    this.api.getRequest("vehicle").subscribe((res: any) => {
      this.vehiclesAvailable = true;
      this.vehicleData = res.vehicleData;
    });
  }

  onSubmit(form: NgForm) {
    form.value.endDate = form.value.startDate;
    form.value.smoker = this.smoke;
    form.value.animals = this.pet;
    form.value.notes = null;
    form.value.vehicleId = this.definedVehicleId;

    if (this.definedVehicleId != null) {
      this.api.postRequest("offer/createOffer", form.value).subscribe((res: any) => {
        if(res.status === 1) {
          form.reset();
          this.success = true;
        }
      });
      this.showFlash();
    } else {
      this.success =false;
      this.showFlash();
    }
  }

  updateSmoke() {
    this.smoke = !this.smoke;
  }

  updatePet() {
    this.pet = !this.pet;
  }

  showFlash() {
    this.showFlashMessage = true;

    setTimeout(() => {
      this.closeFlashMessage();
    }, 5000);
  }

  closeFlashMessage() {
    this.showFlashMessage = false;
  }

  approveUserdata() {
    this.approved = true;
  }

  selectToOffer(item: any) {
    this.definedVehicleId = item.vehicleId;
    this.IsVehicleSelected = true;
    this.selectedVehicleForOffer = item;
    console.log(this.selectedVehicleForOffer);
  }
}
