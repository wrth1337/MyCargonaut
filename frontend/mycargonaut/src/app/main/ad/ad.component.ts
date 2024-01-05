import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.css']
})
export class AdComponent implements OnInit{
  id = 0;
  ad: any; //Use Ad type later on when dev has been merged into this branch 
  user: any;
  authorId = 0;
  isLogin = false;
  state = '';
  type = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
  ){}

  ngOnInit(): void {
    this.isUserLogin();
    this.route.params.subscribe(params => {
      this.id = params['id'];
    })
    console.log(this.id);
    this.api.getRequest('/ad/'+this.id).subscribe((res:any) => {
      this.ad = res.data;
      this.authorId = res.data.userId;
    })
    //reuse parts of profile here 
    this.api.getRequest('/profile').subscribe((res:any) => {
      this.user = res.data;
    })
  }

  isUserLogin(){
    if(this.auth.getToken() != null){this.isLogin = true}
  }
}
