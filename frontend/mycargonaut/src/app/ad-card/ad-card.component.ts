import {Component, Input, numberAttribute} from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import {Ad} from "../main/ad";
import { intermediateGoal } from '../main/intermediateGoal';
import { HttpClientModule} from "@angular/common/http";

@Component({
  selector: 'app-ad-card',
  templateUrl: './ad-card.component.html',
  styleUrls: ['./ad-card.component.css']
})
export class AdCardComponent implements HttpClientModule{
  @Input({transform: numberAttribute}) ad: number | null = null;
  content!: Ad;
  loaded = false;
  constructor(
    private api: ApiService
  ){}
  OnInit(): void {
    this.loaded = false;
    this.api.getRequest('ad/'+this.ad).subscribe((res:any) => {
      this.content = res.data;
      this.api.getRequest('ad/' + res.data.adId + '/intermediate').subscribe((res: any) => {
        if(res) this.content.intermediateGoals = res.data;
        else this.content.intermediateGoals = [];
      })
      this.api.getRequest('ad/' + res.data.adId + '/type').subscribe((res: any) => {
        this.content.type = res.data;
      })
      this.loaded = true;
    })
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
