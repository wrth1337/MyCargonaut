import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { Ad } from '../ad';
import { intermediateGoal } from '../intermediateGoal';
import { AuthService } from 'src/app/service/auth.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit{
  index = 0;
  isLogin = false;
  public content!: Ad[];
  loaded = false;
  constructor(
    private api: ApiService,
    private auth: AuthService
  ){}

  ngOnInit(): void {
    if(this.auth.getToken() != null){this.isLogin = true}
    this.loaded = false;
    this.api.getRequest('ad/last').subscribe((res:any) => {
      this.content = res.data.result;
      this.loaded = true;
      this.content.forEach(n => {
        n.intermediateGoals = [];
        this.api.getRequest('ad/' + n.adId + '/intermediate').subscribe((res: any) => {
          if(res) n.intermediateGoals = res.data;
        })
        this.api.getRequest('ad/' + n.adId + '/type').subscribe((res: any) => {
          n.type = res.data;
        })
      })
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

