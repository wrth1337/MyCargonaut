import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  providers: [DatePipe]
})


export class EditProfileComponent implements OnInit{

  userData: any;
  rating: any;
  tripCount: any;
  stars: number[] = [1, 2, 3, 4, 5];
  editUser = false;
  editBirth = false;
  success = false;
  showFlashMessage = false;

  showFlash() {
    this.showFlashMessage = true;

    setTimeout(() => {
      this.closeFlashMessage();
    }, 5000);
  }

  closeFlashMessage() {
    this.showFlashMessage = false;
  }

  constructor(
    private api: ApiService,
    private datePipe: DatePipe,
    private auth: AuthService
  ){}

  ngOnInit() {
    const userId = JSON.parse(this.auth.getUserData() || '{user_id = 0}').user_id;
    this.api.getRequest("profile/userdata/"+userId).subscribe((res: any) => {
      this.userData = res.userData;
      this.rating = Math.round(res.userData.rating);
      this.userData.birthdate = this.datePipe.transform(res.userData.birthdate, 'dd.MM.yyyy');
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
    if(!this.editUser) {
      form.value.firstName = this.userData.firstName;
      form.value.lastName = this.userData.lastName;
    }
    if(!this.editBirth) {
      const birthdate = this.formatBirthdate();
      this.userData.birthdate = this.datePipe.transform(birthdate, 'yyyy-MM-dd');
      form.value.birthdate = this.userData.birthdate;
    }
    form.value.picture = this.userData.picture;
    this.api.postRequest("profile/edit_profile", form.value).subscribe((res: any) => {
      if(res.status === 1) {
        this.success = true;
      }
    });
    this.userData.birthdate = this.datePipe.transform(this.userData.birthdate, 'dd.MM.yyyy');
    this.editUser = false;
    this.editBirth = false;

    this.showFlash();
  }

  editUsername() {
    this.editUser = !this.editUser;
  }

  editBirthdate() {
    this.editBirth = !this.editBirth;
    if(!this.editBirth) {
      this.userData.birthdate = this.datePipe.transform(this.userData.birthdate, 'dd.MM.yyyy');
    }
    else {
      const birthdate = this.formatBirthdate();
      this.userData.birthdate = this.datePipe.transform(birthdate, 'yyyy-MM-dd');
    }
  }

  formatBirthdate() {
    const dateParts = this.userData.birthdate.split('.');
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);

    const birthdate = new Date(year, month, day);
    return birthdate;
  }

}




