export interface Notification {

    id: string;

    userId: string;

    title: string;

    message: string;

    type:
        | "BOOKING"
        | "PAYMENT"
        | "REVIEW"
        | "CANCELLED"
        | "SYSTEM";

    referenceId?: string;

    read: boolean;

    createdAt?: string;

}