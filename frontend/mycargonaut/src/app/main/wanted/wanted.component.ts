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

  user: any;
  rating: any;
  smoke = true;
  pet = true;
  stars: number[] = [1, 2, 3, 4, 5];
  success = false;
  approved = false;
  showError = false;
  error = false;
  price: any;

  ngOnInit() {
    const userId = JSON.parse(this.auth.getUserData() || '{"user_id" = 0}').user_id;
    this.api.getRequest("profile/userdata/"+userId).subscribe((res: any) => {
      this.user = res.userData;
      this.rating = Math.round(res.userData.rating);
      this.user.birthdate = this.datePipe.transform(res.userData.birthdate, 'dd.MM.yyyy');
    });
  }

  onSubmit(form: NgForm) {
    this.success = false;
    if(this.approved) {
      form.value.endDate = form.value.startDate;
      form.value.smoker = this.smoke;
      form.value.animals = this.pet;
      form.value.notes = null;
      this.api.postRequest("wanted/createWanted", form.value).subscribe((res: any) => {
        if(res.status === 1) {
          form.reset();
          this.success = true;
          this.showError = false;
          this.approved = false;
          this.error = false;
          this.pet = true;
          this.smoke = true;
        } else {
          this.error = true;
        }
      });
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

  approveUserdata() {
    this.approved = true;
  }
}
