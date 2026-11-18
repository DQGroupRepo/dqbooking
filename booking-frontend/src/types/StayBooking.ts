export type BookingType = "STANDARD_SLOT" | "ROOM_STAY" | "DAY_PACKAGE";

export interface StayDateTimeSelection {
  bookingType: BookingType;
  bookingFrom: string;
  bookingTo: string;
  roomQuantity?: number;
  packageId?: string;
}
