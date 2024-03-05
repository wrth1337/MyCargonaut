import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';
import { Ad } from '../ad';
import { intermediateGoal } from '../intermediateGoal';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.css'],
  providers: [DatePipe]
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
  authorId = 4;
  isLogin = false;
  state = '';
  type = '';
  stars: number[] = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private datepipe: DatePipe,
  ){}

  ngOnInit(): void {
    this.getState();
    this.isUserLogin();
    this.route.params.subscribe(params => {
      this.id = params['id'];
    })
    this.api.getRequest('ad/'+this.id).subscribe((res:any) => {
      this.ad = res.data;
      this.api.getRequest('ad/' + res.data.adId + '/intermediate').subscribe((res: any) => {
        if(res) this.ad.intermediateGoals = res.data;
        else this.ad.intermediateGoals = [];
      })
      this.api.getRequest('ad/' + res.data.adId + '/type').subscribe((res: any) => {
        this.ad.type = res.data;
      })
      this.authorId = res.data.userId;
      this.type = res.data.type;
      this.api.getRequest(res.data.type + '/' + res.data.adId).subscribe((res:any) => {
        this.typeSpecificContent = res.data;
      })
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
    const test = this.datepipe.transform(input.startDate, 'dd.MM.yyyy');
    res += ' am ' + test
    return res;
  }
}
