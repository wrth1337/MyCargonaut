import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
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
  arePasswordsMissmatching = false;
  isNotOver18yo = false;

  constructor(
    private api: ApiService,
    private router: Router
  ){}

  onSubmit(form: NgForm){
    if(form.value.password != form.value.passwordRepeat) {
      this.arePasswordsMissmatching = true;
      return;
    }
    this.api.postRequest("user/register", form.value).subscribe(async (res:any) =>{
      if (res.status === 0) {
        await this.router.navigate(['/']);
        location.reload();
      }
    }, (error:any) =>{
      if(error.error.status == 3){
        this.phonenumberInvalid = true;
      }
      if(error.error.status == 4){
        this.emailInvalid = true;
      }
      if(error.error.status == 5){
        this.birthdateInvalid = true;
      }
      if(error.error.status == 6){
        this.isNotOver18yo = true;
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
