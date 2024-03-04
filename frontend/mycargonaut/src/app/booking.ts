export interface Booking {
  bookingId : number;
  userId: number;
  adId: number;
  price: number;
  timeBooking: Date;
  numSeats: number;
  canceled: boolean;
  state: string;
}
