export interface VendorNotification {

    id: number;

    message: string;

    type: "booking" | "payment" | "review" | "cancelled";

    time: string;

}