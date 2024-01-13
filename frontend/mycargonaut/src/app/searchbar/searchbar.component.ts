import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
  exportAs: 'SearchbarComponent'
})
export class SearchbarComponent {
  constructor(private api: ApiService, protected router: Router) {}
  ads: Array<number> = [];
  onSubmit(form: NgForm) {

    const queryParams = Object.keys(form.value)
      .map(key => {
        const value = form.value[key];
        const encodedValue = encodeURIComponent(value !== undefined ? value : 'null');
        return `${encodeURIComponent(key)}=${encodedValue}`;
      })
      .join('&');
    const url = `searchbar/search?${queryParams}`;

    this.api.getRequest(url).subscribe((res: any) => {
      console.log(res); // Überprüfen Sie, ob 'res' das erwartete Format hat
      if (Array.isArray(res)) {
        this.ads = res.map(item => {
          return item.adId;
        });
      }
    });
    this.navigateWithData();
  }
  navigateWithData(){
    this.router.navigate(['/resultpage'], {state: { data: this.ads}});
  }
}
