import {Component, OnInit, ViewChild} from '@angular/core';
import {Chatmessage} from "../chatmessage";
import {ApiService} from "../service/api.service";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../service/auth.service";
import {DatePipe} from "@angular/common";
import {Booking} from "../booking";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [DatePipe],
})
export class ChatComponent implements OnInit {
  @ViewChild('scroll', { static: true }) scroll: any;
  adId: string | null = '4';
  messageList: Chatmessage[] = [];
  bookingList: Booking[] = [];
  bookingListAccepted: Booking[] = [];
  ownUserId = -1;
  userMap = new Map<number, string>();
  newMessage = '';
  isOwner = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private datepipe: DatePipe,
  ){}

  ngOnInit(): void {
    const authUserData = this.auth.getUserData();
    if(authUserData != null) {
      this.ownUserId = JSON.parse(authUserData).user_id;
    }

    this.adId = this.route.snapshot.paramMap.get('id');

    this.api.getRequest('ad/' + this.adId).subscribe(async (res: any) => {
      if (this.ownUserId == res.data.userId) {
        this.isOwner = true;
        this.loadBookingList();
      }
    });

    this.loadMessageList();
  }

  getTime(date:Date) {
    return this.datepipe.transform(date, 'dd.MM.yyy HH:mm');
  }

  async getUsername(userId: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.api.getRequest("profile/userdata/" + userId).subscribe((res: any) => {
        const fullName = res.userData.firstName + ' ' + res.userData.lastName;
        resolve(fullName);
      }, error => {
        reject(error);
      });
    });
  }

  sendMessage() {
    const isWhitespaceString = !this.newMessage.replace(/\s/g, '').length;
    if (isWhitespaceString) {
      return;
    }

    this.api.postRequest("chat/add", {userId: this.ownUserId, adId: this.adId, message: this.newMessage}).subscribe((res:any) => {
      this.loadMessageList();
    });

    this.newMessage = '';
  }

  loadMessageList() {
    this.api.getRequest('chat/getLast/' + this.adId).subscribe(async (res: any) => {
      this.messageList = res.data;
      await this.updateUserMap();
      this.scrollChat();
    });
  }

  async updateUserMap() {
    const userIdSet = new Set<number>();
    this.messageList.forEach((message) => {
      userIdSet.add(message.userId);
    });
    this.bookingList.forEach((booking) => {
      userIdSet.add(booking.userId);
    });
    for (const userId of userIdSet) {
      if (!this.userMap.has(userId)) {
        this.userMap.set(userId, await this.getUsername(userId));
      }
    }
  }

  loadBookingList() {
    this.api.getRequest('booking/ad/' + this.adId).subscribe(async (res: any) => {
      this.bookingList = res.data;
      await this.updateUserMap();
      this.bookingList = this.bookingList.filter( booking => !booking.canceled);

      const confirmedBookings = this.bookingList.filter(booking => booking.state === "confirmed");
      this.bookingListAccepted.push(...confirmedBookings);

      this.bookingList = this.bookingList.filter(booking => booking.state !== "confirmed");
    });
  }

  scrollChat(){
    setTimeout(() => {
      this.scroll.nativeElement.scrollTo(0, this.scroll.nativeElement.scrollHeight);
    }, 0);
  }

  acceptBooking(booking: any) {
    this.api.postRequest('booking/confirm/'+booking.bookingId, {}).subscribe((res:any) => {
      this.loadBookingList();
    });
  }

  rejectBooking(booking: any) {
    this.api.postRequest('booking/denie/'+booking.bookingId, {}).subscribe((res:any) => {
      this.loadBookingList();
    });
  }
}
