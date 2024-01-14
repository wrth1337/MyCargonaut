import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiService } from 'src/app/service/api.service';
import {Router} from "@angular/router";
import {SearchService} from "../service/search.service";

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css'],
  exportAs: 'SearchbarComponent'
})
export class SearchbarComponent {
  constructor(private searchService: SearchService, private api: ApiService, protected router: Router) {}
  ads: Array<number> = [];
  onSubmit(form: NgForm) {
    this.navigateWithData(form);
  }
  navigateWithData(form: NgForm){
    this.searchService.setSearchParameters(form.value);
    this.router.navigate(['/resultpage']); //, {state: { data: this.ads}});
  }
}
