import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-profile-data',
  templateUrl: './profile-data.component.html',
  styleUrls: ['./profile-data.component.css']
})
export class ProfileDataComponent implements OnInit {
  userData: any;
  userId: any;
  ad: any;
  rating: any;
  stars: number[] = [1, 2, 3, 4, 5];
  tripCount: any;
  language = [
    { id: 1, name: 'german', icon: '../../../assets/icons/flag-for-flag-germany-svgrepo-com.svg' },
    { id: 2, name: 'english', icon: '../../../assets/icons/flag-for-flag-united-kingdom-svgrepo-com.svg' },
  ];
  
  languageVariables: { [key: string]: boolean } = {
    german: false,
    english: false,
  }

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    //this.ad = this.route.snapshot.paramMap.get('id');
    this.route.params.subscribe(params => {
      this.ad = params['id'];
    })
    if(this.ad != null) {
      this.api.getRequest('ad/' + this.ad).subscribe((res: any) => {
        this.userId = res.data.userId;
        this.getProfileData(this.userId);
      });
    } else {
      this.userId = JSON.parse(this.auth.getUserData() || '{user_id = 0}').user_id;
      this.getProfileData(this.userId);
    }
  }

  getProfileData(userId: any): void {
    this.api.getRequest("profile/userdata/"+userId).subscribe((res: any) => {
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
    
      this.rating = Math.round(res.userData.rating);
      this.userData.birthdate = this.datePipe.transform(res.userData.birthdate, 'dd.MM.yyyy');
    });

    this.api.getRequest("trip/getTripCount/"+userId).subscribe((res: any) => {
      this.tripCount = res.data;
    });
  }
}
