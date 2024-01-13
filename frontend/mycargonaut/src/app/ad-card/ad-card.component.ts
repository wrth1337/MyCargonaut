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
  }

  writeTitle(inputs: Ad[]) {
    let result = '';
    inputs.forEach(input => {
      let res = '';
      res += input.type === 'offer' ? 'Biete ' : 'Suche ';
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


