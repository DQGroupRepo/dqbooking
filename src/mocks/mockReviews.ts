import type { Review } from "../types/Review";

export const mockReviews: Review[] = [

    {

        id:1,

        customerName:"Arun Kumar",

        serviceName:"Royal Palace Hall",

        rating:5,

        review:"Excellent service. Beautiful venue and very cooperative staff.",

        date:"12 Jul 2026",

        replied:false

    },

    {

        id:2,

        customerName:"Priya",

        serviceName:"Royal Palace Hall",

        rating:4,

        review:"Good experience. Decoration was amazing.",

        date:"09 Jul 2026",

        replied:true,

        vendorReply:"Thank you for your valuable feedback."

    },

    {

        id:3,

        customerName:"Rahul",

        serviceName:"Classic Catering",

        rating:5,

        review:"Food quality was excellent.",

        date:"03 Jul 2026",

        replied:false

    },

    {

        id:4,

        customerName:"Divya",

        serviceName:"Photography",

        rating:3,

        review:"Delivery took longer than expected.",

        date:"29 Jun 2026",

        replied:false

    }

];