import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';
import { Ad } from '../ad';
import { intermediateGoal } from '../intermediateGoal';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-ad',
  templateUrl: './ad.component.html',
  styleUrls: ['./ad.component.css'],
  providers: [DatePipe]
})
export class AdComponent implements OnInit{
  id = 0;
  default = 1;
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
  toFewSeatsResponse = false;
  state = '';
  type = '';
  stars: number[] = [1, 2, 3, 4, 5];
userData: any;

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
      this.authorId = res.data.userId;
      console.log(res);
      this.api.getRequest('ad/' + res.data.adId + '/intermediate').subscribe((res: any) => {
        if(res) this.ad.intermediateGoals = res.data;
        else this.ad.intermediateGoals = [];
      })
      this.api.getRequest('ad/' + res.data.adId + '/type').subscribe((res2: any) => {
        this.ad.type = res2.data;
        this.type = res2.data;
        console.log(res)
        this.api.getRequest(res2.data + '/' + res.data.adId).subscribe((typeSpecRes:any) => {
          this.typeSpecificContent = typeSpecRes.data;
        })
      })
      

      this.api.getRequest("profile/userdata/"+this.authorId).subscribe((res:any) => {
        this.user = res.userData;
        this.user.birthdate = this.datepipe.transform(res.userData.birthdate, 'dd.MM.yyyy')
      })
    })
  }

  getState(){
    this.state = 'Buchen';
  }
  handleButton(){
    switch (this.state){
      case 'Buchen':
        this.api.postRequest('booking',{}).subscribe((res) => {
          console.log(res);
        })
        break;
      case 'Stornieren':
        //trigger cancel modal
        break;
      case 'Bewerten':
        //trigger evaluation
        break;

    }
  }
  onBookingSubmit(form : NgForm) {
    this.toFewSeatsResponse = false;
    this.api.postRequest('booking',{numSeats: form.value.numSeats, adId: this.ad.adId, freight: form.value.freight}).subscribe((res:any) => {
      if (res.status === 1) window.location.reload();
    }, (error:any) =>{
      if (error.error.status === 2) this.toFewSeatsResponse = true;
    });
  }
  cancel() {
    this.toFewSeatsResponse = false;
    this.api.postRequest('booking/cancel/' + this.ad.adId, {}).subscribe((res:any) => {
      console.log(res)
    })
  }
  isUserLogin(){
    if(this.auth.getToken() != null){this.isLogin = true}
  }
  writeTitle(input:Ad) {
    let res = '';
    res += input.type === 'offer' ? 'Biete ' : 'Suche ';
    res += 'Fahrt von ' + input.startLocation;
    if (input.intermediateGoals) {
      input.intermediateGoals.forEach((element: intermediateGoal) => {
        res += ' über ' +element.location
      });      
    }

    res += ' nach ' + input.endLocation;
    const test = this.datepipe.transform(input.startDate, 'dd.MM.yyyy');
    res += ' am ' + test
    return res;
  }
}
