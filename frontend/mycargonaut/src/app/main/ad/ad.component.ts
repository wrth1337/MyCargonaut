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
  seatsAvailable = 0;
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
    userId: 0,
    state: ''
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
  adUserBooking:any;
  bookingDone = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private datepipe: DatePipe,
  ){}

  ngOnInit(): void {
    this.isUserLogin();
    this.route.params.subscribe(params => {
      this.id = params['id'];
    })
    this.api.getRequest('ad/'+this.id).subscribe((res:any) => {
      this.ad = res.data;
      this.authorId = res.data.userId;
      this.api.getRequest('ad/' + res.data.adId + '/intermediate').subscribe((res: any) => {
        if(res) this.ad.intermediateGoals = res.data;
        else this.ad.intermediateGoals = [];
      })
      this.api.getRequest('ad/' + res.data.adId + '/type').subscribe((res2: any) => {
        this.ad.type = res2.data;
        this.type = res2.data;
        this.api.getRequest(res2.data + '/' + res.data.adId).subscribe((typeSpecRes:any) => {
          this.typeSpecificContent = typeSpecRes.data;
        })
      })
      this.api.getRequest('ad/' + res.data.adId + '/seats').subscribe((res: any) => {
        this.seatsAvailable = res.seats;
      })
      this.api.getRequest("profile/userdata/"+this.authorId).subscribe((res:any) => {
        this.user = res.userData;
        this.user.birthdate = this.datepipe.transform(res.userData.birthdate, 'dd.MM.yyyy')
      })
      if (this.isLogin) this.getState();
    })
  }

  getState(){
    const userId = JSON.parse(this.auth.getUserData() || '{"user_id": -1 }').user_id;
    this.api.getRequest("booking").subscribe((bookingRes:any) => {
      if (bookingRes)
        this.adUserBooking = bookingRes.data.find((element: any) => element.adId === this.ad.adId && !element.canceled);
      if (this.ad.userId === userId)
        return this.state = 'Author';
      if (!this.adUserBooking)
        return this.state = 'Buchen';
      if (this.adUserBooking.state === 'denied') {
        return this.state = 'NoOptions';
      }
      if (this.adUserBooking.state === 'confirmed')
        return this.state = 'Confirmed';
      if (this.ad.state === 'finished' && this.adUserBooking.state === 'confirmed') {
        this.api.getRequest('rating/done/'+this.adUserBooking.bookingId).subscribe((ratingRes:any) => {
          if (ratingRes) this.bookingDone = ratingRes.ratingDone;
          if (this.bookingDone) this.state = 'bookingDone';
          else this.state = 'Bewerten';
        });
        return;
      }
      if (this.adUserBooking.canceled)
        return this.state = 'Buchen';
      return this.state = 'Stornieren';
    })
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
    this.api.postRequest('booking/cancel/' + this.adUserBooking.bookingId, {}).subscribe((res:any) => {
      console.log(res)
    });
  }
  start() {
    this.api.postRequest('ad/start/' + this.ad.adId, {}).subscribe((res:any) => {
      if (res) this.ad.state = res.newState;
  });
  }
  stop() {
    this.api.postRequest('ad/stop/' + this.ad.adId, {}).subscribe((res:any) => {
      if (res) this.ad.state = res.newState;
    });
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
