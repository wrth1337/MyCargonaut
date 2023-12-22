import { Component } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [DatePipe]
})


export class ProfileComponent {

  userData: any;
  vehicleData: any;
  offerData: any;
  wantedData: any;
  uwtData: any;
  uotData: any;
  rating: any;
  vehiclesAvailable = false;
  offersAvailable = false;
  wantedsAvailable = false;
  tripsAvailable = false;
  tripCount: any;
  stars: number[] = [1, 2, 3, 4, 5];

  constructor(
    private api: ApiService,
    private datePipe: DatePipe
  ){}

  ngOnInit() {
    console.log("init");
    this.api.getUserProfile().subscribe((res: any) => {
      this.userData = res.userData;
      this.rating = Math.round(res.userData.rating);
      // gibt auch foreach
      this.userData.birthdate = this.datePipe.transform(res.userData.birthdate, 'dd.MM.yyyy');
    });
    this.api.getUserVehicles().subscribe((res: any) => {
      if(res.status === 1) {
        this.vehiclesAvailable = true;
        this.vehicleData = res.vehicleData;
      }
      else {
        this.vehicleData = res.message;
      }
      console.log(this.vehicleData);
    });
    this.api.getUserOffers().subscribe((res: any) => {
      if(res.status === 1) {
        this.offersAvailable = true;
        this.offerData = res.offerData;
        for(let i = 0; i < this.offerData.length; i++) {
          this.offerData[i].startDate = this.datePipe.transform(res.offerData[i].startDate, 'dd.MM.yyyy');
        }
      }
      else {
        this.offerData = res.message;
      }
      console.log(this.offerData);
    });
    this.api.getUserWanteds().subscribe((res: any) => {
      if(res.status === 1) {
        this.wantedsAvailable = true;
        this.wantedData = res.wantedData;
        for(let i = 0; i < this.wantedData.length; i++) {
          this.wantedData[i].startDate = this.datePipe.transform(res.wantedData[i].startDate, 'dd.MM.yyyy');
        }
      }
      else {
        this.wantedData = res.message;
      }
      console.log(this.wantedData);
    });
    this.api.getUserTrips().subscribe((res: any) => {
      if(res.status === 1) {
        this.tripsAvailable = true;
        this.uwtData = res.uwtData;
        this.uotData = res.uotData;
        for(let i = 0; i < this.uwtData.length; i++) {
          this.uwtData[i].startDate = this.datePipe.transform(res.uwtData[i].startDate, 'dd.MM.yyyy');
        }
        for(let i = 0; i < this.uotData.length; i++) {
          this.uotData[i].startDate = this.datePipe.transform(res.uotData[i].startDate, 'dd.MM.yyyy');
        }
        this.tripCount = this.uwtData.length + this.uotData.length;
      }
      else {
        this.uwtData = res.message;
        this.tripCount = 0;
      }
    });
  }
}


