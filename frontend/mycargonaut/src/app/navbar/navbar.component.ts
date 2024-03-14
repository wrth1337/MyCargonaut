import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  coins = -1;
  isLogin = false;
  userId = 0;
  constructor(
    private api: ApiService,
    private auth: AuthService
  ){}
  ngOnInit() {
    this.isUserLogin();
    if (this.isLogin) {
      this.api.getRequest("coins").subscribe((res: any) => {
        this.coins = parseInt(res.coins);
      });
      this.userId = JSON.parse(this.auth.getUserData() || '{user_id = 0}').user_id;
    }

  }
  isUserLogin(){
    if(this.auth.getToken() != null){this.isLogin = true}
  }

}
