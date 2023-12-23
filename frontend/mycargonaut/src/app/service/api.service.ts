import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl = "http://localhost:3000/"
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }
  postRequest(url: any, payload: any){
    return this.http.post(`${this.baseUrl}${url}`, payload).pipe(map(res => {return res;}))
  }
  getUserEmail() {
    const data = this.auth.getUserData();
    const obj = data ? JSON.parse(data) : null;
    const email = obj.email;
    return email;
  }

  getUserProfile(): Observable<any> {
    const email = this.getUserEmail();
    return this.http.get(`${this.baseUrl}profile?email=${email}`).pipe(map(res => res));
  }
  getUserVehicles(): Observable<any> {
    const email = this.getUserEmail();
    return this.http.get(`${this.baseUrl}vehicle?email=${email}`).pipe(map(res => res));
  }
  getUserOffers(): Observable<any> {
    const email = this.getUserEmail();
    return this.http.get(`${this.baseUrl}offer?email=${email}`).pipe(map(res => res));
  }

  getUserWanteds(): Observable<any> {
    const email = this.getUserEmail();
    return this.http.get(`${this.baseUrl}wanted?email=${email}`).pipe(map(res => res));
  }

  getUserTrips(): Observable<any> {
    const email = this.getUserEmail();
    return this.http.get(`${this.baseUrl}trip?email=${email}`).pipe(map(res => res));
  }
}
