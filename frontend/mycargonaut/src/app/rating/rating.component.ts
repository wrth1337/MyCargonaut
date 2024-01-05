import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent {
  isLogin = false;
  passwordIsWeak = false;
  passwordFeedback = false;
  birthdateInvalid = false;
  emailInvalid = false;
  phonenumberInvalid = false;
  zxcvbnFeedback = '';
  arePasswordsMissmatching = false;

  constructor(
    private api: ApiService,
  ){}

  onSubmit(form: NgForm){
    if(form.value.password != form.value.passwordRepeat) {
      this.arePasswordsMissmatching = true;
      return;
    }
    this.api.postRequest("user/register", form.value).subscribe((res:any) =>{
      console.log(res);
    }, (error:any) =>{
      if(error.error.status == 3){
        this.phonenumberInvalid = true;
      }
      if(error.error.status == 4){
        console.log('email invalid');
        this.emailInvalid = true;
      }
      if(error.error.status == 5){
        this.birthdateInvalid = true;
      }
      if(error.error.status == 2){
        this.passwordIsWeak = true;
        if(error.error.feedback.warning) {
          this.passwordFeedback = true;
          this.zxcvbnFeedback = error.error.feedback.warning;
        }
      }
    })
  }

  ngOnInit(): void {
    console.log('init registration');
  }
}
