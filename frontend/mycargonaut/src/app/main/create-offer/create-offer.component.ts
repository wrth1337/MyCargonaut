import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.css'],
})

export class CreateOfferComponent {

  constructor(
    private api: ApiService,
  ) {}

  userData: any;
  rating: any;
  smoke = true;
  pet = true;
  stars: number[] = [1, 2, 3, 4, 5];
  tripCount: any;
  showFlashMessage = false;
  success = false;
  approved = false;

  onSubmit(form: NgForm) {
    form.value.endDate = form.value.startDate;
    form.value.smoker = this.smoke;
    form.value.animals = this.pet;
    form.value.notes = null;
    form.value.vehicleId = 2;

    this.api.postRequest("offer/createOffer", form.value).subscribe((res: any) => {
      if(res.status === 1) {
        form.reset();
        this.success = true;
      }
    });
    this.showFlash();
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
}
