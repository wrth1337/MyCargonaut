import { Component } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})


export class ProfileComponent {

  userData: any;
  vehicleData: any;
  offerData: any;
  wantedData: any;
  vehiclesAvailable = false;
  offersAvailable = false;
  wantedsAvailable = false;

  constructor(
    private api: ApiService
  ){}

  ngOnInit() {
    console.log("init");
    this.api.getUserProfile().subscribe((res: any) => {
      this.userData = res.userData;
      console.log(res.userData);
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
      }
      else {
        this.wantedData = res.message;
      }
      console.log(this.wantedData);
    });
  }
}


