import { Component } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
@Component({
  selector: 'app-coin-modal',
  templateUrl: './coin-modal.component.html',
  styleUrls: ['./coin-modal.component.css']
})
export class CoinModalComponent {
  coinAmount =1;
  constructor(
    private api: ApiService,
  ){}
  addCoins() {
    const coinsToAdd = this.coinAmount;
    console.log('CoinsToAdd: ' + coinsToAdd);
    this.api.postRequest("coins/add", { coins: coinsToAdd }).subscribe((res: any) => {
      console.log(res);
      window.location.reload();
    });
  }
}

