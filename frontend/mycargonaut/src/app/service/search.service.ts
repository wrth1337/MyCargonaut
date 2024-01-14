import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchParams: any;

  constructor() { }

  setSearchParameters(params: any) {
    this.searchParams = params;
  }

  getSearchParameters() {
    return this.searchParams;
  }
}
