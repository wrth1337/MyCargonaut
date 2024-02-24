import {Component, OnInit} from '@angular/core';
import {Chatmessage} from "../chatmessage";
import {ApiService} from "../service/api.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  adId: string | null = '4';
  messageList: Chatmessage[] = [];

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
  ){}

  ngOnInit(): void {
    this.adId = this.route.snapshot.paramMap.get('id');
    this.api.getRequest('chat/getLast/' + this.adId).subscribe((res: any) => {
      this.messageList = res.data;
    });
  }

}
