import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-wanted',
  templateUrl: './wanted.component.html',
  styleUrls: ['./wanted.component.css'],
  providers: [DatePipe]
})
export class WantedComponent implements OnInit {

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private datePipe: DatePipe,
  ) {}

  userData: any;
  rating: any;
  smoke = true;
  pet = true;
  stars: number[] = [1, 2, 3, 4, 5];
  showFlashMessage = false;
  success = false;
  approved = false;
  showError = false;
  price: any;

  ngOnInit() {
    const userId = JSON.parse(this.auth.getUserData() || '{user_id = 0}').user_id;
    this.api.getRequest("profile/userdata/"+userId).subscribe((res: any) => {
      this.userData = res.userData;
      this.rating = Math.round(res.userData.rating);
      this.userData.birthdate = this.datePipe.transform(res.userData.birthdate, 'dd.MM.yyyy');
    });
  }

  onSubmit(form: NgForm) {
    if(this.approved) {
      this.showError = false;
      form.value.endDate = form.value.startDate;
      form.value.smoker = this.smoke;
      form.value.animals = this.pet;
      form.value.notes = null;
      this.api.postRequest("wanted/create_wanted", form.value).subscribe((res: any) => {
        if(res.status === 1) {
          this.success = true;
        }
      });
      this.showFlash();
    } else {
      this.showError = true;
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
}
