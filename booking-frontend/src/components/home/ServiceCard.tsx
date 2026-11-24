import {
    useNavigate
} from "react-router-dom";

import type {
    VendorListing
} from "../../types/VendorListing";

import RatingStars from "../common/RatingStars";
import LocationBadge from "../common/LocationBadge";
import "./ServiceCard.css";


const ServiceCard = ({
    serviceId,
    serviceName,
    businessName,
    description,
    city,
    startingPrice,
    rating,
    reviewCount,
    imageUrl
}: VendorListing) => {


    const navigate =
        useNavigate();


    const handleViewDetails = () => {

        navigate(
            `/services/${serviceId}`
        );

    };


    return (

        <div className="service-card">


            <img

                src={
                    imageUrl ||
                    "/placeholder-service.jpg"
                }

                alt={
                    serviceName || businessName
                }

            />


            <div className="service-content">


                <h3>

                    {serviceName || businessName}

                </h3>


                <LocationBadge city={city} variant="card" />


                {
                    rating !== undefined && (

                        <p className="service-rating">

                            <RatingStars value={rating} size="small" /> {rating.toFixed(1)}

                            {
                                reviewCount !== undefined && (

                                    <span>

                                        {" "}
                                        ({reviewCount})

                                    </span>

                                )
                            }

                        </p>

                    )
                }


                <span>

                    {description}

                </span>


                <h4>

                    Starting from ₹
                    {
                        Number(
                            startingPrice
                        ).toLocaleString()
                    }

                </h4>


                <button

                    type="button"

                    onClick={
                        handleViewDetails
                    }

                >

                    View Details

                </button>


            </div>


        </div>

    );

};


export default ServiceCard;