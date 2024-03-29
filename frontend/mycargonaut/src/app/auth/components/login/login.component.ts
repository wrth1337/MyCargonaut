import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginFailure = false;
  isLogin = false;
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ){}
  ngOnInit(){
    this.isUserLogin();
    this.loginFailure = false;
  }
  onSubmit(form : NgForm){
    this.api.postRequest("user/login", form.value).subscribe((res:any) =>{
      if(res.status == 1){
        this.auth.setDataInLocalStorage('userData', JSON.stringify(res.data));
        this.auth.setDataInLocalStorage('token', res.token);
        window.location.reload();
      }else{
        this.loginFailure = true;
      }
    })
  }
  isUserLogin(){
    if(this.auth.getToken() != null){this.isLogin = true}
  }
  logout(){
    this.auth.clearStorage();
    window.location.reload();
  }
}
