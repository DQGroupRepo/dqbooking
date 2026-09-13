export interface RevenueSummary {
  thisMonth: number;

  totalRevenue: number;

  pendingPayments: number;

  averageBookingValue: number;
}

export interface MonthlyRevenue {
  month: string;

  revenue: number;
}

export interface PaymentHistory {
  id?: string;

  bookingNumber: string;

  customerName: string;

  customer?: string;

  serviceName: string;

  totalAmount: number;

  paidAmount: number;

  paymentStatus: string;

  eventDate: string;

  date?: string;
  amount: number;
  status: string;
}
