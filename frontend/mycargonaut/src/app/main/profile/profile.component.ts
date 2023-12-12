import { Component } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})


export class ProfileComponent {

  constructor(
    private api: ApiService,
  ){}

  ngOnInit(): void {
    console.log("init");
  }
}


