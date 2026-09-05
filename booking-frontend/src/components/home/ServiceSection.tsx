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


    /*
     * =========================================
     * DISPLAY SERVICES
     * =========================================
     *
     * 1 service:
     *
     * 1, 1, 1
     *
     * 2 services:
     *
     * 1, 2, 1
     *
     * 3+ services:
     *
     * Normal 3-card carousel window.
     */

    const displayServices =
        useMemo(
            () => {

                /*
                 * No services.
                 */

                if (
                    services.length === 0
                ) {

                    return [];

                }


                /*
                 * One service.
                 *
                 * Repeat the same service
                 * three times.
                 */

                if (
                    services.length === 1
                ) {

                    return [

                        services[0],

                        services[0],

                        services[0]

                    ];

                }


                /*
                 * Two services.
                 *
                 * Display:
                 *
                 * First
                 * Second
                 * First
                 */

                if (
                    services.length === 2
                ) {

                    return [

                        services[0],

                        services[1],

                        services[0]

                    ];

                }


                /*
                 * Three or more services.
                 *
                 * Display a 3-card window.
                 */

                return services.slice(
                    startIndex,
                    startIndex + 3
                );

            },
            [
                services,
                startIndex
            ]
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

                {
                    services.length === 0 ? (

                        <div className="service-empty-state">

                            <p>

                                No services available
                                at the moment.

                            </p>

                        </div>

                    ) : (

                        <div className="service-grid">


                            {
                                displayServices.map(
                                    (
                                        service,
                                        index
                                    ) => (

                                        <ServiceCard

                                            key={
                                                `${service.serviceId}-${index}`
                                            }

                                            {
                                                ...service
                                            }

                                        />

                                    )
                                )
                            }


                        </div>

                    )
                }


            </div>


        </section>

    );

};


export default ServiceSection;