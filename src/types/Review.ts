export interface Review {

    id: number;

    customerName: string;

    rating: number;

    comment: string;

    serviceName?: string;

    date?: string;

    status?: "Pending" | "Replied";

    vendorReply?: string;

}