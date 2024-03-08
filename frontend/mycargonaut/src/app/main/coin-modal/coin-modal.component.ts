import { Component } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
@Component({
  selector: 'app-coin-modal',
  templateUrl: './coin-modal.component.html',
  styleUrls: ['./coin-modal.component.css']
})
export class CoinModalComponent {
  coinAmount: number =1;
  constructor(
    private api: ApiService,
  ){}
  addCoins() {
    let coinsToAdd = this.coinAmount;
    console.log('CoinsToAdd: ' + coinsToAdd);
    this.api.postRequest("coins/add", { coins: coinsToAdd }).subscribe((res: any) => {
      console.log(res);
      window.location.reload();
    });
  }
}

