import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  providers: [DatePipe]
})


export class EditProfileComponent {

  userData: any;
  rating: any;
  tripCount: any;

  constructor(
    private api: ApiService,
    private datePipe: DatePipe
  ){}

  ngOnInit() {
    this.api.getRequest("profile/userdata").subscribe((res: any) => {
      this.userData = res.userData;
      this.rating = Math.round(res.userData.rating);
      this.userData.birthdate = this.datePipe.transform(res.userData.birthdate, 'yyyy-MM-dd');
    });

    this.api.getRequest("trip").subscribe((res: any) => {
      if(res != null) {
        this.tripCount = res.uwtData.length + res.uotData.length;
      }
      else {
        this.tripCount = 0;
      }
    });
    
  }

  onSubmit(form: NgForm) {
    this.api.postRequest("profile/edit_profile", form.value).subscribe((res: any) => {
    });
  }

}




