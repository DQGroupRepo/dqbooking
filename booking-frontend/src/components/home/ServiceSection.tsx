import {
    useEffect,
    useMemo,
    useState
} from "react";

import ServiceCard
    from "./ServiceCard";

import type {
    VendorListing
} from "../../types/VendorListing";

import "./ServiceSection.css";


interface Props {

    title: string;

    subtitle: string;

    services: VendorListing[];

}


const ServiceSection = ({
    title,
    subtitle,
    services
}: Props) => {


    /*
     * =========================================
     * CAROUSEL POSITION
     * =========================================
     */

    const [
        startIndex,
        setStartIndex
    ] = useState(0);


    /*
     * =========================================
     * RESET CAROUSEL
     * =========================================
     *
     * Reset the visible position when the
     * service data changes.
     */

    useEffect(() => {

        setStartIndex(0);

    }, [
        services
    ]);


    // Fill the three desktop card positions when only one or two eligible
    // listings exist. Repeated cards are display-only and link to the same
    // underlying service.
    const displayServices = useMemo(
        () => {
            if (services.length > 3) {
                return services.slice(startIndex, startIndex + 3);
            }

            if (services.length === 0) {
                return [];
            }

            return Array.from(
                { length: 3 },
                (_, index) => services[index % services.length]
            );
        },
        [services, startIndex]
    );


    /*
     * =========================================
     * CAROUSEL AVAILABILITY
     * =========================================
     *
     * Navigation is only possible when
     * there are more than 3 services.
     */

    const canGoPrevious =
        services.length > 3 &&
        startIndex > 0;


    const canGoNext =
        services.length > 3 &&
        startIndex <
            services.length - 3;


    /*
     * =========================================
     * PREVIOUS
     * =========================================
     */

    function handlePrevious() {

        if (
            !canGoPrevious
        ) {

            return;

        }


        setStartIndex(
            previous =>
                Math.max(
                    0,
                    previous - 1
                )
        );

    }


    /*
     * =========================================
     * NEXT
     * =========================================
     */

    function handleNext() {

        if (
            !canGoNext
        ) {

            return;

        }


        setStartIndex(
            previous =>
                Math.min(
                    services.length - 3,
                    previous + 1
                )
        );

    }


    // Empty discovery sections should not create blank space on the homepage.
    if (services.length === 0) return null;

    return (

        <section className="service-section">


            <div className="container">


                {/* =====================================
                    SECTION HEADER
                ===================================== */}

                <div className="service-section-header">


                    <div>

                        <h2 className="section-title">

                            {title}

                        </h2>


                        <p className="section-subtitle">

                            {subtitle}

                        </p>

                    </div>


                    {/* =====================================
                        CAROUSEL BUTTONS
                    =====================================

                        Always display the buttons.

                        If there are 3 or fewer services,
                        both buttons remain visible but
                        disabled.
                    */}

                    <div className="service-carousel-buttons">


                        <button

                            type="button"

                            onClick={
                                handlePrevious
                            }

                            disabled={
                                !canGoPrevious
                            }

                            aria-label={
                                `Previous ${title}`
                            }

                        >

                            ‹

                        </button>


                        <button

                            type="button"

                            onClick={
                                handleNext
                            }

                            disabled={
                                !canGoNext
                            }

                            aria-label={
                                `Next ${title}`
                            }

                        >

                            ›

                        </button>


                    </div>


                </div>


                {/* =====================================
                    EMPTY STATE
                ===================================== */}

                <div className="service-grid">
                    {displayServices.map((service, index) => (
                        <ServiceCard
                            key={`${service.serviceId}-${index}`}
                            {...service}
                        />
                    ))}
                </div>


            </div>


        </section>

    );

};


export default ServiceSection;