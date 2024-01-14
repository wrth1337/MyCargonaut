import {Component, EventEmitter, Output} from '@angular/core';
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
  @Output() searchEvent = new EventEmitter<any>();

  constructor(private api: ApiService, private searchService: SearchService, protected router: Router) {}

  onSubmit(form: NgForm) {
    this.searchService.setSearchParameters(form.value);
    this.router.navigate(['/resultpage']);
  }
}
