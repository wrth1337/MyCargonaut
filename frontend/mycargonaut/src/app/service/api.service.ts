import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl = "http://localhost:3000/"
  constructor(
    private http: HttpClient
  ) { }
  postRequest(url: any, payload: any){
    return this.http.post(`${this.baseUrl}${url}`, payload).pipe(map(res => {return res;}))
  }
  getRequest(url: any){
    return this.http.get(`${this.baseUrl}${url}`).pipe(map(res => {return res;}))
  }
}
