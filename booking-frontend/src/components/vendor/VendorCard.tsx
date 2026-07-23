import { Link } from "react-router-dom";
import type { VendorListing } from "../../types/VendorListing";
import "./VendorCard.css";


interface VendorCardProps {

    vendor: VendorListing;

}

const VendorCard = ({
  vendor
}: VendorCardProps) => {
  console.log("VendorCard:", vendor);
return (

    <div className="listing-card">


    <img
        src={vendor.imageUrl ?? "/images/no-image.png"}
        alt={vendor.businessName}
    />


    <div className="listing-info">


    <h3>{vendor.businessName}</h3>

    <p>{vendor.serviceName}</p>


    <p>
    📍 {vendor.city}
    </p>


    {vendor.capacity && (

    <p>
    Capacity: {vendor.capacity} Guests
    </p>

    )}



    <div className="listing-footer">


    <div>

    <div className="rating">

    ⭐ {vendor.rating}

    </div>


    <h4>
    ₹{vendor.startingPrice.toLocaleString()} onwards
    </h4>


    </div>

    <Link
    to={`/vendor/${vendor.serviceId}`}
    >

    <button>
    View Details
    </button>

    </Link>


    </div>


    </div>


    </div>

);

};


export default VendorCard;