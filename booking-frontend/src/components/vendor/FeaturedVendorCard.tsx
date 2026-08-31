import { Link } from "react-router-dom";

import type { FeaturedService }
    from "../../types/FeaturedService";

import "./FeaturedVendorCard.css";


interface Props {

    service: FeaturedService;

}


export default function FeaturedVendorCard({
    service
}: Props) {

    const image =
        service.imageUrl ||
        "/images/no-image.png";

    return (

        <div className="featured-card">

            <img
                src={image}
                alt={service.serviceName}
            />


            <div className="featured-info">

                <h3>
                    {
                        service.serviceName
                    }
                </h3>


                <p>
                    {
                        service.businessName
                    }
                </p>


                <p>
                    📍 {service.city}
                </p>


                <div className="featured-rating">

                    ⭐ {service.rating}

                    {
                        service.reviewCount > 0 && (
                            <span>
                                {" "}
                                ({service.reviewCount})
                            </span>
                        )
                    }

                </div>


                <h4>

                    ₹
                    {
                        Number(
                            service.startingPrice
                        ).toLocaleString(
                            "en-IN"
                        )
                    }

                    {" "}
                    onwards

                </h4>


                <Link
                    to={`/vendor/${service.serviceId}`}
                >
                    <button
                        type="button"
                    >
                        View Details
                    </button>
                </Link>

            </div>

        </div>

    );

}