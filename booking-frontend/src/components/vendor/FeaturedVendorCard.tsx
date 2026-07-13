import { Link } from "react-router-dom";
import type { Vendor } from "../../types/Vendor";

import "./FeaturedVendorCard.css";


interface Props {

  vendor: Vendor;

}


const FeaturedVendorCard = ({
  vendor
}: Props) => {


return (

<div className="featured-card">


<img

src={vendor.imageUrl}

alt={vendor.businessName}

/>



<div className="featured-info">


<h3>
{vendor.businessName}
</h3>



<p>
📍 {vendor.city}
</p>



<div className="featured-rating">

⭐ {vendor.rating}

</div>



<h4>

₹{vendor.startingPrice.toLocaleString("en-IN")} onwards

</h4>



<Link
to={`/vendor/${vendor.id}`}
>

<button>
View Details
</button>

</Link>


</div>


</div>

);


};


export default FeaturedVendorCard;