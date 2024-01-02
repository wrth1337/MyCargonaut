import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { Ad } from '../ad';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
   
export class HomeComponent implements OnInit{
  index = 0;
  public content: any;
  loaded = false;
  constructor(
    private api: ApiService
  ){}
  
  ngOnInit(): void {
    this.loaded = false;
    this.api.getRequest('ad/last').subscribe((res:any) => {
      this.content = res.data.result;
      this.loaded = true;
      console.log(res.data.result);
    })
  }
  next() {
    this.index++;
    this.index = this.index % 6;
  }
  previous() {
    this.index--;
    this.index = (((this.index) % 6) + 6) % 6;
//JS besitzt keinen Modulo operator wtffffff
  }
  writeTitle(input:Ad) {
    let res = '';
    res += input.type === 'offer' ? 'Biete ' : 'Suche ';
    res += 'Fahrt von ' + input.startLocation;
    input.intermediateGoals.forEach((element: string) => {
      res += 'über ' +element
    });

    res += ' nach ' + input.endLocation;
    return res;
  }
}

