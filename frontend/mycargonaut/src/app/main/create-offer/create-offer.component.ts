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
  definedVehicleId = null;
  IsVehicleSelected = false;
  success = false;
  error = false;
  approved = false;
  showErrorProfile = false;
  showErrorVehicle = false;
  selectedVehicleForOffer = {
    loadingAreaDimensions: null,
    maxWeight: null,
    name: null,
    numSeats: null,
    picture: null,
    specialFeatures: null,
    vehicleId: null,
  };

  ngOnInit() {
    const userId = JSON.parse(this.auth.getUserData() || '{"user_id" = 0}').user_id;
    this.api.getRequest("profile/userdata/" + userId).subscribe((res: any) => {
      this.userData = res.userData;
      this.rating = Math.round(res.userData.rating);
      this.userData.birthdate = this.datePipe.transform(res.userData.birthdate, 'dd.MM.yyyy');
    });
    this.api.getRequest("trip/getTripCount/"+userId).subscribe((res: any) => {
      this.tripCount = res.data.length;
    });
    this.api.getRequest("vehicle/"+userId).subscribe((res: any) => {
      this.vehiclesAvailable = true;
      this.vehicleData = res.vehicleData;
    });
  }


  onSubmit(form: NgForm) {
    this.success = false;
    form.value.endDate = form.value.startDate;
    form.value.smoker = this.smoke;
    form.value.animals = this.pet;
    form.value.notes = null;
    form.value.vehicleId = this.definedVehicleId;

    this.showErrorProfile = !this.approved;
    this.showErrorVehicle = !this.IsVehicleSelected;

    if(this.approved && this.IsVehicleSelected) {
      this.api.postRequest("offer/createOffer", form.value).subscribe((res: any) => {
        if(res.status === 1) {
          form.reset();
          this.success = true;
          this.showErrorProfile = false;
          this.showErrorVehicle = false;
          this.approved = false;
          this.error = false;
          this.pet = true;
          this.smoke = true;
        } else {
          this.error = true;
        }
      });
    }
  }

  updateSmoke() {
    this.smoke = !this.smoke;
  }

  updatePet() {
    this.pet = !this.pet;
  }

  approveUserdata() {
    this.approved = true;
  }

  selectToOffer(item: any) {
    this.definedVehicleId = item.vehicleId;
    this.IsVehicleSelected = true;
    this.selectedVehicleForOffer = item;
  }
}
