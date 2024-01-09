import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-wanted',
  templateUrl: './wanted.component.html',
  styleUrls: ['./wanted.component.css'],
  providers: [DatePipe]
})
export class WantedComponent {

  constructor(
    private api: ApiService,
    private datePipe: DatePipe
  ) {}

  userData: any;
  rating: any;
  smoke: boolean = true;
  pet: boolean = true;
  stars: number[] = [1, 2, 3, 4, 5];
  tripCount: any;

  ngOnInit() {
    this.api.getRequest("profile/userdata").subscribe((res: any) => {
      this.userData = res.userData;
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
  }

  onSubmit(form: NgForm) {
    form.value.endDate = form.value.startDate;
    form.value.smoker = this.smoke;
    form.value.animals = this.pet;
    form.value.notes = null;

    this.api.postRequest("wanted/createWanted", form.value).subscribe((res: any) => {
    });
  }

  updateSmoke() {
    this.smoke = !this.smoke;
  }

  updatePet() {
    this.pet = !this.pet;
  }
}
