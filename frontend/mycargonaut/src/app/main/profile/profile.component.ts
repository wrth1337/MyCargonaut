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
  languages: any;
  vehiclesAvailable = false;
  offersAvailable = false;
  wantedsAvailable = false;
  tripsAvailable = false;
  tripCount: any;
  stars: number[] = [1, 2, 3, 4, 5];
  
  languageVariables: { [key: string]: boolean } = {
    german: false,
    english: false,
  };

  languageMap: { [key: number]: string } = {
    1: 'german',
    2: 'english',
  };

  constructor(
    private api: ApiService,
    private datePipe: DatePipe
  ){}

  ngOnInit() {

    this.api.getRequest("profile/userdata").subscribe((res: any) => {
      this.userData = res.userData;
      this.languages = res.languages;
      
      for (const lang of Object.keys(this.languageVariables)) {
        this.languageVariables[lang] = false;
      }
    
      for (const langObj of this.languages) {
        const langVariable = this.languageMap[langObj.languageId];
        if (langVariable) {
          this.languageVariables[langVariable] = true;
        }
      }
    
      this.rating = Math.round(res.userData.rating);
      this.userData.birthdate = this.datePipe.transform(res.userData.birthdate, 'dd.MM.yyyy');
    });

    this.api.getRequest("vehicle").subscribe((res: any) => {
      if(res != null) {
        this.vehiclesAvailable = true;
        this.vehicleData = res.vehicleData;
      }
    });

    this.api.getRequest("offer").subscribe((res: any) => {
      if(res != null) {
        this.offersAvailable = true;
        this.offerData = res.offerData;
        for(let i = 0; i < this.offerData.length; i++) {
          this.offerData[i].startDate = this.datePipe.transform(res.offerData[i].startDate, 'dd.MM.yyyy');
        }
      }
    });

    this.api.getRequest("wanted").subscribe((res: any) => {
      if(res != null) {
        this.wantedsAvailable = true;
        this.wantedData = res.wantedData;
        for(let i = 0; i < this.wantedData.length; i++) {
          this.wantedData[i].startDate = this.datePipe.transform(res.wantedData[i].startDate, 'dd.MM.yyyy');
        }
      }
    });

    this.api.getRequest("trip").subscribe((res: any) => {
      if(res != null) {
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
        this.tripCount = 0;
      }
    });
  }
}


