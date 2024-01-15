import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {ApiService} from "../service/api.service";
import {SearchService} from "../service/search.service";

@Component({
  selector: 'app-resultpage',
  templateUrl: './resultpage.component.html',
  styleUrls: ['./resultpage.component.css']
})

export class ResultpageComponent{
  ads: Array<number> = [];

  constructor(private router: Router, private api: ApiService, private searchService: SearchService) {}

  ngOnInit() {
    this.searchService.searchEvent.subscribe((searchParams) => {
      this.loadSearchResults(searchParams);
    });
    const existingSearchParams = this.searchService.getCurrentSearchParams();
    if (existingSearchParams) {
      this.loadSearchResults(existingSearchParams);
    }
  }

  loadSearchResults(searchParams:any) {
    if (searchParams) {
      const queryParams = this.createQueryParams(searchParams);
      const url = `searchbar/search?${queryParams}`;

      this.api.getRequest(url).subscribe((res: any
      ) => {
        if (Array.isArray(res)) {
          this.ads = res.map(item => item.adId);
        }
      });
    }
  }

  createQueryParams(searchParams: any): string {
    return Object.keys(searchParams)
      .map(key => {
        const value = searchParams[key];
        const encodedValue = encodeURIComponent(value !== undefined ? value : 'null');
        return `${encodeURIComponent(key)}=${encodedValue}`;
      })
      .join('&');
  }

  navigateToHome(){
    this.router.navigate(['/']);
  }
}

