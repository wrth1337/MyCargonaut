import { Component } from '@angular/core';
import {NgIf, NgOptimizedImage} from "@angular/common";
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  coins: String = "";
  isLogin = false;
  constructor(
    private api: ApiService,
    private auth: AuthService
  ){}
  ngOnInit() {
    this.isUserLogin();
    if (this.isLogin) {
      this.api.getRequest("coins").subscribe((res: any) => {
        this.coins = JSON.stringify(res.coins);
      });
    }
  }
  isUserLogin(){
    if(this.auth.getToken() != null){this.isLogin = true}
  }

}
