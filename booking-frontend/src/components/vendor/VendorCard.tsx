import { Link } from "react-router-dom";
import type { VendorListing } from "../../types/VendorListing";
import RatingStars from "../common/RatingStars";
import "./VendorCard.css";

interface VendorCardProps {
    vendor: VendorListing;
}

const VendorCard = ({
    vendor
}: VendorCardProps) => {

    const mediaUrl =
        vendor.imageUrl ?? "/images/no-image.png";

    const cleanUrl =
        mediaUrl.split("?")[0].toLowerCase();

    const isVideo =
        cleanUrl.endsWith(".mp4") ||
        cleanUrl.endsWith(".webm") ||
        cleanUrl.endsWith(".mov") ||
        cleanUrl.endsWith(".avi") ||
        cleanUrl.endsWith(".ogg") ||
        cleanUrl.includes("video");

    return (

        <div className="listing-card">

            {/* Service Media */}

            <div className="listing-media">

                {isVideo ? (

                    <video
                        src={mediaUrl}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="listing-media-content"
                    />

                ) : (

                    <img
                        src={mediaUrl}
                        alt={vendor.businessName}
                        className="listing-media-content"
                        onError={(e) => {
                            e.currentTarget.src =
                                "/images/no-image.png";
                        }}
                    />

                )}

            </div>


            {/* Service Details */}

            <div className="listing-info">

               <div className="vendor-title-section">

                   <h3>
                       {vendor.serviceName}
                   </h3>

                   {vendor.businessName && (

                       <p className="vendor-business-name">

                           <span>
                               by
                           </span>

                           <strong>
                               {vendor.businessName}
                           </strong>

                       </p>

                   )}

                   <p className="vendor-location">
                       📍 {vendor.city}
                   </p>

               </div>


                {vendor.capacity && (

                    <p>
                        Capacity: {vendor.capacity} Guests
                    </p>

                )}


                <div className="listing-footer">

                    <div>

                        <div className="rating">
                            <RatingStars value={Number(vendor.rating ?? 0)} size="small" />
                            <span>{Number(vendor.rating ?? 0).toFixed(1)}</span>
                            {vendor.reviewCount > 0 && <span className="listing-review-count">({vendor.reviewCount})</span>}
                        </div>


                        <h4>

                            ₹
                            {vendor.startingPrice == null
                                ? "Price unavailable"
                                : vendor.startingPrice.toLocaleString("en-IN")}
                            {" "}onwards

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