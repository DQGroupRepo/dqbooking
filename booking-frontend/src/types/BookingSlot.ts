export interface BookingSlot {
  id: string;

  serviceId: string;

  slotName: string;

  startTime: string;

  endTime: string;

  maxBookings: number;

  displayOrder: number;

  active?: boolean;

  allowOverlap?: boolean;

  createdAt?: string;

  updatedAt?: string;
}
