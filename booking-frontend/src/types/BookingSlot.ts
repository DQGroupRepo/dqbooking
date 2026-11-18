export interface BookingSlot {
  id: string;

  serviceId: string;

  slotName: string;

  resourceTypeId?: string | null;
  bookingPattern?: "DAILY_RECURRING" | "CONTINUOUS";

  startTime: string;

  endTime: string;

  maxBookings: number;

  allowOverlap?: boolean;

  displayOrder: number;

  active: boolean;

  createdAt?: string;

  updatedAt?: string;
}
