import { Link } from "react-router-dom";
import "./VendorDashboard.css";


const VendorDashboard = () => {


    const stats = [

        {
            value:"125",
            label:"Total Bookings"
        },

        {
            value:"18",
            label:"Pending Requests"
        },

        {
            value:"4.8",
            label:"Average Rating"
        },

        {
            value:"₹8.4L",
            label:"Revenue"
        }

    ];



    const bookings = [

        {
            customer:"Rahul Kumar",
            service:"Wedding Hall",
            date:"12 Dec 2026",
            status:"Pending"
        },

        {
            customer:"Priya Sharma",
            service:"Reception Hall",
            date:"20 Jan 2027",
            status:"Confirmed"
        },

        {
            customer:"Arun Raj",
            service:"Corporate Event",
            date:"08 Nov 2026",
            status:"Pending"
        }

    ];




    const reviews = [

        {
            rating:"⭐⭐⭐⭐⭐",
            comment:"Amazing venue and excellent support.",
            customer:"Deepika"
        },

        {
            rating:"⭐⭐⭐⭐⭐",
            comment:"Well maintained hall and parking.",
            customer:"Karthik"
        }

    ];




    return (

        <section className="vendor-dashboard">


            <div className="dashboard-container">



                <h1>
                    Vendor Dashboard
                </h1>


                <p className="welcome-text">

                    Welcome back, Royal Palace Hall

                </p>





                {/* STATISTICS */}


                <div className="stats-grid">


                    {
                        stats.map((item)=>(


                            <div
                                className="stat-card"
                                key={item.label}
                            >

                                <h2>
                                    {item.value}
                                </h2>

                                <span>
                                    {item.label}
                                </span>


                            </div>


                        ))
                    }


                </div>







                {/* ACTION BUTTONS */}


                <div className="dashboard-actions">


                    <Link to="/add-service">

                        <button className="add-service-btn">

                            + Add New Service

                        </button>

                    </Link>




                    <Link to="/manage-services">

                        <button className="manage-service-btn">

                            Manage Services

                        </button>

                    </Link>


                </div>









                <div className="dashboard-layout">





                    {/* MAIN SECTION */}


                    <div className="dashboard-main">





                        <h2>
                            Recent Booking Requests
                        </h2>





                        <table className="booking-table">


                            <thead>

                                <tr>

                                    <th>
                                        Customer
                                    </th>


                                    <th>
                                        Service
                                    </th>


                                    <th>
                                        Date
                                    </th>


                                    <th>
                                        Status
                                    </th>


                                </tr>

                            </thead>





                            <tbody>


                            {
                                bookings.map((booking)=>(


                                    <tr key={booking.customer}>


                                        <td>
                                            {booking.customer}
                                        </td>


                                        <td>
                                            {booking.service}
                                        </td>


                                        <td>
                                            {booking.date}
                                        </td>


                                        <td>

                                            <span
                                            className={
                                                booking.status==="Confirmed"
                                                ?
                                                "confirmed-status"
                                                :
                                                "pending-status"
                                            }
                                            >

                                                {booking.status}

                                            </span>

                                        </td>


                                    </tr>


                                ))
                            }


                            </tbody>


                        </table>









                        <h2 className="review-title">

                            Latest Reviews

                        </h2>





                        {
                            reviews.map((review)=>(


                                <div
                                className="review-card"
                                key={review.customer}
                                >


                                    <div className="review-stars">

                                        {review.rating}

                                    </div>



                                    <p>

                                        {review.comment}

                                    </p>



                                    <strong>

                                        - {review.customer}

                                    </strong>


                                </div>


                            ))
                        }



                    </div>









                    {/* SIDEBAR */}



                    <div className="dashboard-sidebar">


                        <div className="quick-actions">


                            <h3>
                                Quick Actions
                            </h3>




                            <button>

                                Manage Availability

                            </button>




                            <Link to="/manage-services">

                                <button className="secondary-action">

                                    View Listings

                                </button>

                            </Link>




                            <button className="secondary-action">

                                Download Reports

                            </button>



                        </div>



                    </div>





                </div>



            </div>



        </section>

    );


};


export default VendorDashboard;