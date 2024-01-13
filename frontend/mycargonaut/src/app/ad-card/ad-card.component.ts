import {Component, Input, numberAttribute, OnInit} from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import {Ad} from "../main/ad";
import { intermediateGoal } from '../main/intermediateGoal';

@Component({
  selector: 'app-ad-card',
  templateUrl: './ad-card.component.html',
  styleUrls: ['./ad-card.component.css']
})
export class AdCardComponent {
  @Input() ad: number | null = null;
  index = 0;
  public content: any;
  loaded = false;
  type: any;
  constructor(
    private api: ApiService
  ){}
  ngOnInit(): void {
    this.loaded = false;
    const url = `ad/byId?adId=${this.ad}`;
    this.api.getRequest(url).subscribe((res:any) => {
      this.content = res.data;
      this.loaded = true;
    })
    const urlType = `ad/type?adId=${this.ad}`;
    this.api.getRequest(urlType).subscribe((res:any) => {
      this.type = res.data;
    })
  }

  writeTitle(inputs: Ad[]) {
    let result = '';
    inputs.forEach(input => {
      let res = '';
      res += this.type === 'offer' ? 'Biete ' : 'Suche ';
      res += 'Fahrt von ' + input.startLocation;
      if (input.intermediateGoals) {
        input.intermediateGoals.forEach((element: intermediateGoal) => {
          res += ' über ' + element.location;
        });
      }
      res += ' nach ' + input.endLocation;
      result += res + '\n';
    });
    return result;
  }
}


