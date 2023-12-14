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
      this.vehicleData = res.vehicleData;
      console.log(res.vehicleData);
    });
  }
}


