import { Link } from "react-router-dom";
import type { Vendor } from "../../types/Vendor";
import "./VendorCard.css";


interface VendorCardProps {
  vendor: Vendor;
}


const VendorCard = ({
  vendor
}: VendorCardProps) => {

return (

<div className="listing-card">


<img
src={vendor.imageUrl}
alt={vendor.businessName}
/>


<div className="listing-info">


<h3>
{vendor.businessName}
</h3>


<p>
📍 {vendor.city}
</p>


{vendor.capacity && (

<p>
Capacity: {vendor.capacity} Guests
</p>

)}


{vendor.amenities && (

<p>
{vendor.amenities.join(" • ")}
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
to={`/vendor/${vendor.id}`}
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