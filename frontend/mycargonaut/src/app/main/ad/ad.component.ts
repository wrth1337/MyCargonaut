import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';
import { Ad } from '../ad';

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.css']
})
export class AdComponent implements OnInit{
  id = 0;
  ad: Ad = {
    adId: 0,
    description: '',
    startLocation: '',
    endLocation: '',
    intermediateGoals: [],
    type: '',
    startDate: new Date,
    endDate: new Date,
    animals: false,
    smoker: false,
    notes: '',
    numSeats: 0,
    active: false,
    userId: 0
  };
  user: any;
  authorId = 4;
  isLogin = false;
  state = '';
  type = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
  ){}

  ngOnInit(): void {
    this.getState();
    this.isUserLogin();
    this.route.params.subscribe(params => {
      this.id = params['id'];
    })
    console.log(this.id);
    this.api.getRequest('/ad/'+this.id).subscribe((res:any) => {
      this.ad = res.data;
      this.authorId = res.data.userId;
    })
    
    this.api.getRequest("profile/userdata/"+this.authorId).subscribe((res:any) => {
      this.user = res.userData;
      console.log(res.userData)
    })
    console.log(this.user)
  }

  getState(){
    this.state = 'Stornieren';
  }
  handleButton(){
    switch (this.state){
      case 'Buchen':
        //trigger booking modal
        break;
      case 'Stornieren':
        //trigger cancel modal
        break;
      case 'Bewerten':
        //trigger evaluation
        break;

    }
  }
  isUserLogin(){
    if(this.auth.getToken() != null){this.isLogin = true}
  }
}
