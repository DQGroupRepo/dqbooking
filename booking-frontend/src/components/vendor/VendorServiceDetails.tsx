import {
    FaBuilding,
    FaUsers,
    FaMapMarkerAlt,
    FaCity,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle
} from "react-icons/fa";

import type {
    VendorDetail
} from "../../types/VendorDetail";

import "./VendorServiceDetails.css";


interface VendorServiceDetailsProps {

    vendor: VendorDetail;

}


const VendorServiceDetails = (
    {
        vendor
    }: VendorServiceDetailsProps
) => {


    /*
     * =========================================
     * FORMAT ATTRIBUTE LABEL
     * =========================================
     */

    const formatLabel = (
        value: string
    ): string => {


        return value

            .replace(
                /([A-Z])/g,
                " $1"
            )

            .replace(
                /^./,
                character =>
                    character.toUpperCase()
            )

            .trim();

    };


    /*
     * =========================================
     * FORMAT ATTRIBUTE VALUE
     * =========================================
     */

    const formatValue = (
        value: string
    ) => {


        if (
            value === "true"
        ) {

            return (
                <span className="detail-value available">

                    <FaCheckCircle />

                    Available

                </span>
            );

        }


        if (
            value === "false"
        ) {

            return (
                <span className="detail-value unavailable">

                    <FaTimesCircle />

                    Not Available

                </span>
            );

        }


        return value;

    };


    /*
     * =========================================
     * FORMAT DATE
     * =========================================
     */

    const formatDate = (
        date?: string
    ) => {


        if (!date) {

            return "-";

        }


        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    };


    return (


        <>


            {/* =========================================
                VENUE INFORMATION
               ========================================= */}

            <div className="vendor-details-card">


                <h2>

                    <FaBuilding />

                    Venue Information

                </h2>


                <div className="venue-information-grid">


                    <div className="venue-info-item">

                        <div className="venue-info-label">

                            <FaBuilding />

                            Category

                        </div>


                        <strong>

                            {
                                vendor.category ||
                                "-"
                            }

                        </strong>

                    </div>


                    <div className="venue-info-item">

                        <div className="venue-info-label">

                            <FaUsers />

                            Capacity

                        </div>


                        <strong>

                            {
                                vendor.capacity
                                    ? `${vendor.capacity.toLocaleString()} Guests`
                                    : "-"
                            }

                        </strong>

                    </div>


                    <div className="venue-info-item">

                        <div className="venue-info-label">

                            <FaCity />

                            City

                        </div>


                        <strong>

                            {
                                vendor.city ||
                                "-"
                            }

                        </strong>

                    </div>


                    <div className="venue-info-item">

                        <div className="venue-info-label">

                            <FaMapMarkerAlt />

                            Location

                        </div>


                        <strong>

                            {
                                vendor.location ||
                                "-"
                            }

                        </strong>

                    </div>


                </div>


                {

                    vendor.description && (

                        <div className="venue-description">

                            <h3>

                                About This Venue

                            </h3>


                            <p>

                                {
                                    vendor.description
                                }

                            </p>

                        </div>

                    )

                }


            </div>


            {/* =========================================
                DETAIL SECTIONS
               ========================================= */}

            {

                vendor.detailSections &&
                vendor.detailSections.length > 0 && (

                    vendor.detailSections.map(
                        section => (

                            <div
                                key={
                                    section.key
                                }
                                className="vendor-details-card"
                            >


                                <h2>

                                    {
                                        section.title
                                    }

                                </h2>


                                <div className="detail-sections-grid">


                                    {

                                        section.attributes.map(
                                            (
                                                attribute,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        `${attribute.key}-${index}`
                                                    }
                                                    className="facility-item"
                                                >


                                                    <span className="facility-label">

                                                        {
                                                            formatLabel(
                                                                attribute.key
                                                            )
                                                        }

                                                    </span>


                                                    <strong>

                                                        {
                                                            formatValue(
                                                                attribute.value
                                                            )
                                                        }

                                                    </strong>


                                                </div>

                                            )

                                        )

                                    }


                                </div>


                            </div>

                        )

                    )

                )

            }


        </>


    );

};


export default VendorServiceDetails;