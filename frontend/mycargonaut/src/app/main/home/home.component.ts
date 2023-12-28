import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
   
export class HomeComponent implements OnInit{
  index = 2;
  public content = [{Title: 'Suche Transport von Gießen nach Marburg 1', Text: 'Ich Suche einen Transport meines Klaviers von Gießen nach Marburg bis ende des Jahres. Wenn Sie einen Kleintransporter oder ähnliches haben und auf dem Weg von Gießen nach Marburg sind, würde ich mich über ein Angebot freuen. 1'},{Title: 'Suche Transport von Gießen nach Marburg 2', Text: 'Ich Suche einen Transport meines Klaviers von Gießen nach Marburg bis ende des Jahres. Wenn Sie einen Kleintransporter oder ähnliches haben und auf dem Weg von Gießen nach Marburg sind, würde ich mich über ein Angebot freuen. 2'},{Title: 'Suche Transport von Gießen nach Marburg 3', Text: 'Ich Suche einen Transport meines Klaviers von Gießen nach Marburg bis ende des Jahres. Wenn Sie einen Kleintransporter oder ähnliches haben und auf dem Weg von Gießen nach Marburg sind, würde ich mich über ein Angebot freuen. 3'},{Title: 'Suche Transport von Gießen nach Marburg 4', Text: 'Ich Suche einen Transport meines Klaviers von Gießen nach Marburg bis ende des Jahres. Wenn Sie einen Kleintransporter oder ähnliches haben und auf dem Weg von Gießen nach Marburg sind, würde ich mich über ein Angebot freuen. 4'},{Title: 'Suche Transport von Gießen nach Marburg 5', Text: 'Ich Suche einen Transport meines Klaviers von Gießen nach Marburg bis ende des Jahres. Wenn Sie einen Kleintransporter oder ähnliches haben und auf dem Weg von Gießen nach Marburg sind, würde ich mich über ein Angebot freuen. 5'},{Title: 'Suche Transport von Gießen nach Marburg 6', Text: 'Ich Suche einen Transport meines Klaviers von Gießen nach Marburg bis ende des Jahres. Wenn Sie einen Kleintransporter oder ähnliches haben und auf dem Weg von Gießen nach Marburg sind, würde ich mich über ein Angebot freuen. 6'}];
  public activeContent = this.content.slice(0,3);
  
  constructor(
    private api: ApiService
  ){}
  
  ngOnInit(): void {
    this.api.getRequest('offer/last').subscribe((res:any) => {
      this.content = res.content;
    })
  }
  next() {    
    this.index++;
    this.index = this.index % 6;
    this.activeContent[0] = this.activeContent[1];
    this.activeContent[1] = this.activeContent[2];
    this.activeContent[2] = this.content[this.index]

  }
  previous() {
    this.index--;
    this.index = this.index % 6;
    this.activeContent[2] = this.activeContent[1];
    this.activeContent[1] = this.activeContent[0];
    this.activeContent[0] = this.content[(((this.index-2) % 6) + 6) % 6] //JS besitzt keinen Modulo operator wtffffff
  }
}

