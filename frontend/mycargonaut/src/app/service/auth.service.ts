import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getUserData(){
    return localStorage.getItem('userData');
  }
  setDataInLocalStorage(key: string, value: string){
    localStorage.setItem(key, value);
  }
  getToken(){
    return localStorage.getItem('token');
  }
  clearStorage(){
    localStorage.clear();
  }
}
