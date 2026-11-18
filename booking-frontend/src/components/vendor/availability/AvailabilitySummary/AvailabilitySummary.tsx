import MobileCarousel from "../../../common/MobileCarousel/MobileCarousel";
import "./AvailabilitySummary.css";

interface Props{

    selectedDate:Date;

    totalSlots:number;

    blockedSlots:number;

    availableCapacity:number;

    isStayService?: boolean;

}

export default function AvailabilitySummary({

    selectedDate,

    totalSlots,

    blockedSlots,

    availableCapacity,

    isStayService = false

}:Props){

    return(

        <MobileCarousel className="availability-summary" ariaLabel="Availability summary" itemsPerPage={2}>

            <div className="summary-card">

                <span>Selected Date</span>

                <h3>

                    {

                        selectedDate.toLocaleDateString()

                    }

                </h3>

            </div>

            <div className="summary-card">

                <span>Booking Slots</span>

                <h3>{totalSlots}</h3>

            </div>

            <div className="summary-card">

                <span>Blocked</span>

                <h3>{blockedSlots}</h3>

            </div>

            {!isStayService && <div className="summary-card">

                <span>Available Capacity</span>

                <h3>{availableCapacity}</h3>

            </div>}

        </MobileCarousel>

    );

}