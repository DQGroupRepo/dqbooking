import type { VendorBookingDetails } from "../types/VendorBookingDetails";

export const mockVendorBookingDetails: VendorBookingDetails[] = [

{

id:1,

bookingNumber:"BK-2026-0001",

status:"Pending",

customer:{

name:"Rahul Sharma",

mobile:"9876543210",

email:"rahul@gmail.com",

address:"Anna Nagar, Chennai"

},

event:{

type:"Wedding",

eventDate:"2026-09-14",

startTime:"09:00 AM",

endTime:"10:00 PM",

guests:600

},

service:{

category:"Wedding Hall",

name:"Royal Palace Hall",

package:"Premium",

price:150000

},

amenities:[

"Parking",

"Dining Hall",

"Generator",

"AC Hall",

"Bridal Room"

],

specialRequests:[

"Need wheelchair access",

"Decoration starts previous evening"

],

payment:{

totalAmount:150000,

advancePaid:50000,

advancePaidDate:"01 Aug 2026",

balanceAmount:100000,

balancePaidDate:"",

paymentStatus:"Advance Paid",

paymentMethod:"UPI",

transactionId:"TXN245687"

},

timeline:[

{

title:"Booking Created",

date:"01 Aug 2026"

},

{

title:"Advance Paid",

date:"01 Aug 2026"

}

]

},
{

id:2,

bookingNumber:"BK-2026-0002",

status:"Approved",

customer:{

name:"Priya Menon",

mobile:"9876543211",

email:"priya@gmail.com",

address:"Coimbatore"

},

event:{

type:"Reception",

eventDate:"2026-11-02",

startTime:"06:00 PM",

endTime:"11:00 PM",

guests:400

},

service:{

category:"Wedding Hall",

name:"Royal Palace Hall",

package:"Standard",

price:90000

},

amenities:[

"Parking",

"Dining Hall"

],

specialRequests:[

"Need projector"

],

payment:{

totalAmount:90000,

advancePaid:50000,

advancePaidDate:"20 Sep 2026",

balanceAmount:40000,

balancePaidDate:"",

paymentStatus:"Advance Paid",

paymentMethod:"Bank Transfer",

transactionId:"TXN998877"

},

timeline:[

{

title:"Booking Created",

date:"20 Sep 2026"

},

{

title:"Advance Paid",

date:"20 Sep 2026"

},

{

title:"Vendor Approved",

date:"21 Sep 2026"

}

]

}

];