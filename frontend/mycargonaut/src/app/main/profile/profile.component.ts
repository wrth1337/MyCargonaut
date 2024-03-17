import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [DatePipe]
})


export class ProfileComponent implements OnInit {
  id = 0;
  idUrl = 0;
  isOwner = false;
  userData = {
    firstName: '',
    lastName: '',
    birthdate: '',
    picture: '',
    description: '',
    experience: ''
  };
  vehicleData: any;
  offerData: any;
  wantedData: any;
  tripData: any;
  rating: any;
  ratingData: any;
  vehiclesAvailable = false;
  offersAvailable = false;
  wantedsAvailable = false;
  tripsAvailable = false;
  tripCount = 0;
  xp = 0;
  level = 1;
  ratingsAvailable = false;
  stars: number[] = [1, 2, 3, 4, 5];

  language = [
    { id: 1, name: 'german', icon: '../../../assets/icons/flag-for-flag-germany-svgrepo-com.svg' },
    { id: 2, name: 'english', icon: '../../../assets/icons/flag-for-flag-united-kingdom-svgrepo-com.svg' },
  ];

  languageVariables: { [key: string]: boolean } = {
    german: false,
    english: false,
  }

  newVehicleFailure = false;
  updateVehicle = false;
  selectedVehicle = {
    loadingAreaDimensions: null,
    maxWeight: null,
    name: null,
    numSeats: null,
    picture: null,
    specialFeatures: null,
    vehicleId: null,
  };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private datePipe: DatePipe,
    private location: Location,
    private route: ActivatedRoute
  ){}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.isOwner = false;
      this.idUrl = params['id'];
      this.id = JSON.parse(this.auth.getUserData() || '{"user_id": 0}').user_id;
      if(this.idUrl == this.id) {
        this.isOwner = true;
      }
    
      this.api.getRequest("profile/userdata/"+this.idUrl).subscribe((res: any) => {
        this.userData = res.userData;

        for (const lang of this.language) {
          this.languageVariables[lang.name] = false;
        }

        for (const langObj of res.languages) {
            const langVariable = this.language.find(lang => lang.id === langObj.languageId);
            if (langVariable) {
              this.languageVariables[langVariable.name] = true;
            }
        }
        if(!this.isOwner) {
          this.userData.lastName = this.userData.lastName.substring(0, 1) + ".";
        }

        this.rating = Math.round(res.userData.rating);
        this.userData.birthdate = this.datePipe.transform(res.userData.birthdate, 'dd.MM.yyyy')!;
      });

      this.api.getRequest("vehicle/"+this.idUrl).subscribe((res: any) => {
        if(res != null) {
          this.vehiclesAvailable = true;
          this.vehicleData = res.vehicleData;
        } else {
          this.vehiclesAvailable = false;
        }
      });

      this.api.getRequest("offer/getUserOffer/"+this.idUrl).subscribe((res: any) => {
        if(res != null) {
          this.offersAvailable = true;
          this.offerData = res.offerData;
          for(let i = 0; i < this.offerData.length; i++) {
            this.offerData[i].startDate = this.datePipe.transform(res.offerData[i].startDate, 'dd.MM.yyyy');
          }
        } else {
          this.offersAvailable = false;
        }
      });

      this.api.getRequest("wanted/getUserWanted/"+this.idUrl).subscribe((res: any) => {
        if(res != null) {
          this.wantedsAvailable = true;
          this.wantedData = res.wantedData;
          for(let i = 0; i < this.wantedData.length; i++) {
            this.wantedData[i].startDate = this.datePipe.transform(res.wantedData[i].startDate, 'dd.MM.yyyy');
          }
        } else {
          this.wantedsAvailable = false;
        }
      });

      this.api.getRequest("trip/"+this.idUrl).subscribe((res: any) => {
        if(res != null) {
          this.tripsAvailable = true;
          this.tripData = res.tripData;
          for(let i = 0; i < this.tripData.length; i++) {
            this.tripData[i].startDate = this.datePipe.transform(res.tripData[i].startDate, 'dd.MM.yyyy');
          }
          this.tripCount = this.tripData.length;
        }
        else {
          this.tripCount = 0;
          this.tripsAvailable = false;
        }
      });

      this.api.getRequest("profile/experience/"+this.idUrl).subscribe((res: any) => {
        if(res != null) {
          this.level = Math.floor(res.data / 100) + 1;
          this.xp = res.data % 100;
        }
      });
    });
  }
  back(){
    this.location.back()
  }
  onSubmit(form : NgForm) {
    this.newVehicleFailure = false;
    let url = "vehicle";
    if(this.updateVehicle) url += '/' + this.selectedVehicle.vehicleId;
    this.api.postRequest(url, form.value).subscribe((res:any) => {
      if(res.status === 1){
        window.location.reload();
      }else {
        this.newVehicleFailure = true;
      }
    })
  }
  selectVehicle(item:any) {
    this.updateVehicle = true;
    this.selectedVehicle = item;
  }
  clearSelectedVehicle() {
    this.updateVehicle = false;
    this.selectedVehicle = {
      loadingAreaDimensions: null,
      maxWeight: null,
      name: null,
      numSeats: null,
      picture: null,
      specialFeatures: null,
      vehicleId: null,
    };
  }
  deleteVehicle() {
    this.api.deleteRequest('vehicle/' + this.selectedVehicle.vehicleId).subscribe((res:any) => {
      if(res)window.location.reload();
    })
  }
  openRatingModal() {
    this.api.getRequest('profile/userrating/'+this.idUrl).subscribe((res:any) => {
      if(res != null) {
        this.ratingsAvailable = true;
        this.ratingData = res.ratingData;
        this.ratingData.forEach((el: any) => {
          el.lastName = el.lastName.substring(0, 1) + ".";
        });
      } else {
        this.ratingsAvailable = false;
      }
    });
  }
}


