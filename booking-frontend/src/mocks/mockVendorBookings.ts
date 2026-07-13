import type { VendorBooking } from "../types/VendorBooking";

export const mockVendorBookings: VendorBooking[] = [

    {
        id:1,
        customerName:"Arun Kumar",
        eventName:"Wedding Reception",
        eventDate:"15 Dec 2026",
        amount:45000,
        status:"Pending"
    },

    {
        id:2,
        customerName:"Priya Sharma",
        eventName:"Birthday Party",
        eventDate:"20 Dec 2026",
        amount:28000,
        status:"Confirmed"
    },

    {
        id:3,
        customerName:"Rahul Singh",
        eventName:"Corporate Event",
        eventDate:"24 Dec 2026",
        amount:65000,
        status:"Cancelled"
    }

];