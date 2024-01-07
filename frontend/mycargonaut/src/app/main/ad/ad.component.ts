import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';
import { Ad } from '../ad';
import { intermediateGoal } from '../intermediateGoal';

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
  typeSpecificContent:any = {};
  user: any = {};
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
    this.api.getRequest('ad/'+this.id).subscribe((res:any) => {
      this.ad = res.data;
      this.authorId = res.data.userId;
      this.type = res.data.type;
      this.api.getRequest('ad/'+res.data.type + '/' + res.data.adId).subscribe((res:any) => {
        this.typeSpecificContent = res.data;
      })
    })
    this.api.getRequest("profile/userdata/"+this.authorId).subscribe((res:any) => {
      this.user = res.userData;
    })
  }

  getState(){
    this.state = 'Buchen';
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
  writeTitle(input:Ad) {
    let res = '';
    res += input.type === 'offer' ? 'Biete ' : 'Suche ';
    res += 'Fahrt von ' + input.startLocation;
    input.intermediateGoals.forEach((element: intermediateGoal) => {
      res += ' über ' +element.location
    });
    res += ' nach ' + input.endLocation;
    return res;
  }
}
