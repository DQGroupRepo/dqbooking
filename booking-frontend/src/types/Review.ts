export interface Review {
  id: string;

  bookingId: string;

  rating: number;

  comment: string;

  vendorReply?: string;

  reviewDate?: string;

  date?: string;

  replyDate?: string;

  customerName?: string;

  customerEmail?: string;

  customerProfileImage?: string;

  serviceName?: string;
}
