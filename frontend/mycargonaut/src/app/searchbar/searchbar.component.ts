import {Component} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  standalone: true,
  styleUrls: ['./searchbar.component.css']
})

export class SearchbarComponent {
  constructor(private api: ApiService) {}
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

    });
  }
}
