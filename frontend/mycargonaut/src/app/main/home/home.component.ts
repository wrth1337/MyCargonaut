import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { Ad } from '../ad';
import { intermediateGoal } from '../intermediateGoal';
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
    })
  }
  next() {
    this.index++;
    this.index = this.index % 6;
  }
  previous() {
    this.index--;
    this.index = (((this.index) % 6) + 6) % 6;
  }
  writeTitle(input:Ad) {
    let res = '';
    res += input.type === 'offer' ? 'Biete ' : 'Suche ';
    res += 'Fahrt von ' + input.startLocation;
    input.intermediateGoals.forEach((element: intermediateGoal) => {
      res += ' über ' +element.location
    });
    res += ' nach ' + input.endLocation;
    return res;
  }
}

