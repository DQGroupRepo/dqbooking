export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled";

export interface VendorBooking {

  id:number;

  customerName:string;

  eventName:string;

  eventDate:string;

  amount:number;

  status:BookingStatus;

}