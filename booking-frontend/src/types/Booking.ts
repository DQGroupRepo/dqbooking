export interface Booking {
  bookingId: number;
  vendorId: number;
  customerId: number;
  eventDate: string;
  totalAmount: number;
  guestCount: number;
  status: string;
}