import {EventEmitter, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchEvent = new EventEmitter<any>();
  private currentSearchParams: any;
  // eslint-disable-next-line
  constructor() { }
  setSearchParameters(params: any) {
    this.currentSearchParams = params;
    this.searchEvent.emit(params);
  }
  getCurrentSearchParams() {
    return this.currentSearchParams;
  }
}
