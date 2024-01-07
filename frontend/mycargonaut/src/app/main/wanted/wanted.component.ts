import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-wanted',
  templateUrl: './wanted.component.html',
  styleUrls: ['./wanted.component.css']
})
export class WantedComponent {

  constructor(
    private api: ApiService
  ) {}

  smoke: boolean = true;
  pet: boolean = true;

  onSubmit(form: NgForm) {
    form.value.endDate = null;
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
