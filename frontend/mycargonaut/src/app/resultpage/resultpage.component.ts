import { Component } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-resultpage',
  templateUrl: './resultpage.component.html',
  styleUrls: ['./resultpage.component.css']
})
export class ResultpageComponent {
  ads: Array<number> = [];
  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any};
    console.log(state.data);
    this.ads = state.data;
  }
}