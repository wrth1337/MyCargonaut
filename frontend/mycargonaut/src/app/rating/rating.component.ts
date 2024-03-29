import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from "../service/api.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})

export class RatingComponent {
  @Input() userWhoIsEvaluating: any;
  @Input() bookingId: any;
  @Input() userWhoWasEvaluated: any;
  @Input() userIsDriver: any;

  constructor(private api: ApiService) {}

  onSubmit(form: NgForm){
    const formData = {
      bookingId: this.bookingId,
      userWhoWasEvaluated: this.userWhoWasEvaluated,
      punctuality: form.value.punctualityRating,
      agreement: form.value.agreementRating,
      pleasent: form.value.pleasentRating,
      freight: form.value.freightRating,
      comment: form.value.comment
    };
    this.api.postRequest("rating", formData).subscribe();
  }
}

