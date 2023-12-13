import { Component } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})


export class ProfileComponent {

  data: any;

  constructor(
    private api: ApiService,
  ){}

  ngOnInit() {
    console.log("init");
    this.api.getUserProfile().subscribe((res: any) => {
      this.data = res.data;
      console.log(res.data);
    });
  }
}


