import { Link } from "react-router-dom";
import type { VendorListing } from "../../types/VendorListing";
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

                <h3>
                    {vendor.businessName}
                </h3>

                <p>
                    {vendor.serviceName}
                </p>

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

                            ₹
                            {vendor.startingPrice.toLocaleString()}
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