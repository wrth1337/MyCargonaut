import { Component } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  coins = -1;
  isLogin = false;
  constructor(
    private api: ApiService,
    private auth: AuthService
  ){}
  OnInit() {
    this.isUserLogin();
    if (this.isLogin) {
      this.api.getRequest("coins").subscribe((res: any) => {
        this.coins = parseInt(res.coins);
      });
    }
  }
  isUserLogin(){
    if(this.auth.getToken() != null){this.isLogin = true}
  }

}
