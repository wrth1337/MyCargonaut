import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  isLogin = false;
  passwordIsWeak = false;
  passwordFeedback = false;
  birthdateInvalid = false;
  emailInvalid = false;
  phonenumberInvalid = false;
  zxcvbnFeedback = '';

  constructor(
    private api: ApiService,
  ){}

  onSubmit(form: NgForm){
    // TODO: code wird durch http-fehlercode abgebrochen. muss noch gefixt werden
    this.api.postRequest("user/register", form.value).subscribe((res:any) =>{
      console.log("registration complete");
    }, (error:any) =>{
      if(error.status == 3){
        this.phonenumberInvalid = true;
      }
      if(error.status == 4){
        this.emailInvalid = true;
      }
      if(error.status == 5){
        this.birthdateInvalid = true;
      }
      if(error.status == 2){
        this.passwordIsWeak = true;
        if(error.feedback.warning) {
          this.passwordFeedback = true;
          this.zxcvbnFeedback = error.feedback.warning;
        }
      }
    })
  }
}
