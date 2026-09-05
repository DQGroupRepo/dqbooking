import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import BundleService
    from "../../services/BundleService";

import CartService
    from "../../services/CartService";

import VendorListingService
    from "../../services/VendorListingService";

import type {
    Bundle
} from "../../types/Bundle";

import type {
    VendorListing
} from "../../types/VendorListing";

import "./BundleSelection.css";


interface BundleNavigationState {

    fromBundle?: boolean;

    bundleId?: string;

    bundleRootServiceId?: string;

    bundleName?: string;

    bundleDescription?: string;

    bundleServiceIds?: string[];

    bundleDiscountType?:
        | "PERCENTAGE"
        | "FIXED";

    bundleDiscountValue?: number;

}


const BundleSelection = () => {


    const {
        serviceId
    } =
        useParams();


    const navigate =
        useNavigate();


    const location =
        useLocation();


    const navigationState =
        location.state as
        BundleNavigationState | null;


    /*
     * =========================================
     * BUNDLE STATE
     * =========================================
     */

    const [
        bundle,
        setBundle
    ] =
        useState<Bundle | null>(
            null
        );


    const [
        loading,
        setLoading
    ] =
        useState(
            true
        );


    /*
     * =========================================
     * BUNDLE SERVICE DETAILS
     * =========================================
     *
     * These are loaded from the existing
     * customer service listing API.
     *
     * We do NOT change the existing bundle API.
     */

    const [
        availableServices,
        setAvailableServices
    ] =
        useState<
            VendorListing[]
        >([]);


    const [
        servicesLoading,
        setServicesLoading
    ] =
        useState(
            false
        );


    /*
     * =========================================
     * CART STATE
     * =========================================
     */

    const [
        cartServiceIds,
        setCartServiceIds
    ] =
        useState<
            string[]
        >([]);


    /*
     * =========================================
     * SWITCH BUNDLE POPUP
     * =========================================
     */

    const [
        showSwitchPopup,
        setShowSwitchPopup
    ] =
        useState(
            false
        );


    /*
     * =========================================
     * LOAD CART
     * =========================================
     */

    const refreshCart =
        () => {

            const cartItems =
                CartService.getCart();


            setCartServiceIds(

                cartItems.map(
                    item =>
                        item.serviceId
                )

            );

        };


    useEffect(
        () => {

            refreshCart();

        },
        []
    );


    /*
     * =========================================
     * LOAD SELECTED BUNDLE
     * =========================================
     */

    useEffect(
        () => {

            if (
                !serviceId
            ) {

                return;

            }


            loadBundle(
                serviceId
            );

        },
        [
            serviceId
        ]
    );


    const loadBundle =
        async (
            rootServiceId: string
        ) => {

            try {

                setLoading(
                    true
                );


                /*
                 * =====================================
                 * CASE 1
                 *
                 * Bundle passed through navigation.
                 * =====================================
                 */

                if (

                    navigationState?.bundleId &&

                    navigationState?.bundleServiceIds

                ) {

                    const selectedBundle:
                        Bundle = {

                            id:
                                navigationState.bundleId,

                            vendorId:
                                "",

                            name:
                                navigationState.bundleName ||
                                "Selected Bundle",

                            description:
                                navigationState.bundleDescription,

                            serviceIds:
                                navigationState.bundleServiceIds,

                            discountType:
                                navigationState.bundleDiscountType ||
                                "PERCENTAGE",

                            discountValue:
                                navigationState.bundleDiscountValue ||
                                0,

                            active:
                                true

                        };


                    setBundle(
                        selectedBundle
                    );


                    return;

                }


                /*
                 * =====================================
                 * CASE 2
                 *
                 * Direct bundle URL.
                 * =====================================
                 */

                const bundles =
                    await BundleService
                        .getBundlesForService(
                            rootServiceId
                        );


                /*
                 * One bundle.
                 */

                if (
                    bundles.length === 1
                ) {

                    setBundle(
                        bundles[0]
                    );

                    return;

                }


                /*
                 * Multiple bundles.
                 */

                if (
                    bundles.length > 1
                ) {

                    navigate(
                        `/vendor/${rootServiceId}`,
                        {

                            state: {

                                openBundlePopup:
                                    true

                            }

                        }
                    );

                    return;

                }


                setBundle(
                    null
                );

            }
            catch (
                error
            ) {

                console.error(
                    "Failed to load selected bundle:",
                    error
                );


                setBundle(
                    null
                );

            }
            finally {

                setLoading(
                    false
                );

            }

        };


    /*
     * =========================================
     * LOAD SERVICE DETAILS
     * =========================================
     *
     * Uses the existing:
     *
     * GET /customer/services
     *
     * Then matches the returned services with
     * bundle.serviceIds.
     */

    useEffect(
        () => {

            if (
                !bundle
            ) {

                return;

            }


            loadBundleServiceDetails();

        },
        [
            bundle
        ]
    );


    const loadBundleServiceDetails =
        async () => {

            try {

                setServicesLoading(
                    true
                );


                const services =
                    await VendorListingService
                        .getListings();


                setAvailableServices(
                    services
                );

            }
            catch (
                error
            ) {

                console.error(
                    "Failed to load bundle service details:",
                    error
                );


                setAvailableServices(
                    []
                );

            }
            finally {

                setServicesLoading(
                    false
                );

            }

        };


    /*
     * =========================================
     * MATCH BUNDLE SERVICES
     * =========================================
     *
     * Keep the same order as bundle.serviceIds.
     */

    const bundleServices =
        useMemo(
            () => {

                if (
                    !bundle
                ) {

                    return [];

                }


                return bundle.serviceIds
                    .map(
                        id =>

                            availableServices.find(
                                service =>
                                    service.serviceId ===
                                    id
                            )
                    )
                    .filter(
                        (
                            service
                        ):
                            service is VendorListing =>
                                Boolean(
                                    service
                                )
                    );

            },
            [
                bundle,
                availableServices
            ]
        );


    /*
     * =========================================
     * SERVICES REMAINING
     * =========================================
     */

    const remainingServiceIds =
        bundle

            ? bundle.serviceIds.filter(

                id =>

                    !cartServiceIds.includes(
                        id
                    )

            )

            : [];


    const allServicesAdded =
        !!bundle &&

        remainingServiceIds.length ===
        0;


    /*
     * =========================================
     * PROGRESS
     * =========================================
     */

    const completedServiceCount =
        bundle

            ? bundle.serviceIds.filter(

                id =>

                    cartServiceIds.includes(
                        id
                    )

            ).length

            : 0;


    const totalServiceCount =
        bundle?.serviceIds.length ||
        0;


    const bundleProgress =
        totalServiceCount > 0

            ? (
                completedServiceCount /
                totalServiceCount
            ) * 100

            : 0;


    /*
     * =========================================
     * OPEN SERVICE DETAILS
     * =========================================
     *
     * IMPORTANT:
     *
     * This is kept exactly compatible with
     * your existing flow.
     *
     * All bundle values continue to be passed
     * to the Vendor Detail page.
     */

    const handleOpenService =
        (
            nextServiceId: string
        ) => {

            if (
                !bundle
            ) {

                return;

            }


            navigate(
                `/vendor/${nextServiceId}`,
                {

                    state: {

                        fromBundle:
                            true,

                        bundleRootServiceId:
                            serviceId,

                        bundleId:
                            bundle.id,

                        bundleName:
                            bundle.name,

                        bundleDescription:
                            bundle.description,

                        bundleServiceIds:
                            bundle.serviceIds,

                        bundleDiscountType:
                            bundle.discountType,

                        bundleDiscountValue:
                            bundle.discountValue

                    } as BundleNavigationState

                }
            );

        };


    /*
     * =========================================
     * GO TO CART
     * =========================================
     */

    const handleGoToCart =
        () => {

            navigate(
                "/cart"
            );

        };


    /*
     * =========================================
     * SWITCH BUNDLE
     * =========================================
     */

    const handleSwitchBundle =
        () => {

            if (
                allServicesAdded
            ) {

                navigate(
                    `/vendor/${serviceId}`,
                    {

                        state: {

                            openBundlePopup:
                                true

                        }

                    }
                );

                return;

            }


            setShowSwitchPopup(
                true
            );

        };


    /*
     * =========================================
     * CONFIRM SWITCH
     * =========================================
     */

    const confirmSwitchBundle =
        () => {

            setShowSwitchPopup(
                false
            );


            if (
                !serviceId
            ) {

                navigate(
                    "/cart"
                );

                return;

            }


            navigate(
                `/vendor/${serviceId}`,
                {

                    state: {

                        openBundlePopup:
                            true

                    }

                }
            );

        };


    /*
     * =========================================
     * CANCEL SWITCH
     * =========================================
     */

    const cancelSwitchBundle =
        () => {

            setShowSwitchPopup(
                false
            );

        };


    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (
        loading
    ) {

        return (

            <div className="bundle-selection-page">

                <div className="bundle-selection-container">

                    <div className="bundle-loading-card">

                        <div className="bundle-loading-spinner" />

                        <h2>
                            Loading your bundle...
                        </h2>

                        <p>
                            Please wait while we prepare
                            your selected services.
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    /*
     * =========================================
     * NO BUNDLE
     * =========================================
     */

    if (
        !bundle
    ) {

        return (

            <div className="bundle-selection-page">

                <div className="bundle-selection-container">

                    <div className="bundle-not-found">

                        <div className="bundle-not-found-icon">

                            !

                        </div>

                        <h2>
                            Bundle not found
                        </h2>

                        <p>
                            We couldn't find the selected
                            bundle.
                        </p>

                        <button
                            type="button"
                            onClick={
                                handleGoToCart
                            }
                        >

                            Go to Cart

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    /*
     * =========================================
     * UI
     * =========================================
     */

    return (

        <div className="bundle-selection-page">


            <div className="bundle-selection-container">


                {/* =====================================
                    BUNDLE HERO
                ===================================== */}

                <section className="bundle-hero">


                    <div className="bundle-hero-content">


                        <span className="bundle-eyebrow">

                            BUNDLE SELECTION

                        </span>


                        <h1>

                            {bundle.name}

                        </h1>


                        {
                            bundle.description && (

                                <p className="bundle-description">

                                    {
                                        bundle.description
                                    }

                                </p>

                            )
                        }


                    </div>


                    <div className="bundle-discount-box">


                        <span>

                            Bundle Savings

                        </span>


                        <strong>

                            {
                                bundle.discountType ===
                                "PERCENTAGE"

                                    ? `${bundle.discountValue}% OFF`

                                    : `₹${Number(
                                        bundle.discountValue
                                    ).toLocaleString(
                                        "en-IN"
                                    )} OFF`
                            }

                        </strong>

                    </div>


                    {/* =============================
                        PROGRESS
                    ============================= */}

                    <div className="bundle-progress-section">


                        <div className="bundle-progress-header">

                            <div>

                                <strong>
                                    Bundle Progress
                                </strong>

                                <span>

                                    {
                                        completedServiceCount
                                    }

                                    {" of "}

                                    {
                                        totalServiceCount
                                    }

                                    {" services completed"}

                                </span>

                            </div>


                            <strong>

                                {
                                    Math.round(
                                        bundleProgress
                                    )
                                }

                                %

                            </strong>

                        </div>


                        <div className="bundle-progress-track">

                            <div
                                className="bundle-progress-fill"
                                style={{

                                    width:
                                        `${bundleProgress}%`

                                }}
                            />

                        </div>


                    </div>


                </section>


                {/* =====================================
                    SERVICES CARD
                ===================================== */}

                <section className="bundle-services-card">


                    <div className="bundle-services-header">


                        <div>

                            <h2>

                                Services Included

                            </h2>


                            <p>

                                Open each service and add it
                                to your cart to complete
                                the bundle.

                            </p>

                        </div>


                        <span className="bundle-service-count">

                            {
                                totalServiceCount
                            }

                            {" "}

                            {
                                totalServiceCount === 1
                                    ? "Service"
                                    : "Services"
                            }

                        </span>


                    </div>


                    {/* =================================
                        SERVICE LIST
                    ================================= */}

                    <div className="bundle-service-list">


                        {
                            servicesLoading ? (

                                <div className="bundle-services-loading">

                                    Loading service details...

                                </div>

                            ) : (

                                bundle.serviceIds.map(
                                    (
                                        id,
                                        index
                                    ) => {


                                        const service =
                                            bundleServices.find(
                                                item =>
                                                    item.serviceId ===
                                                    id
                                            );


                                        const alreadyAdded =
                                            cartServiceIds.includes(
                                                id
                                            );


                                        const serviceImage =
                                            service?.imageUrl ||
                                            "/images/no-image.png";


                                        return (

                                            <div
                                                key={id}
                                                className={
                                                    alreadyAdded

                                                        ? "bundle-service-item bundle-service-added"

                                                        : "bundle-service-item"
                                                }
                                            >


                                                {/* NUMBER / STATUS */}

                                                <div className="bundle-service-step">


                                                    {
                                                        alreadyAdded

                                                            ? "✓"

                                                            : index + 1
                                                    }

                                                </div>


                                                {/* IMAGE */}

                                                <div className="bundle-service-image">

                                                    <img
                                                        src={
                                                            serviceImage
                                                        }
                                                        alt={
                                                            service?.serviceName ||
                                                            "Service"
                                                        }
                                                    />

                                                </div>


                                                {/* DETAILS */}

                                                <div className="bundle-service-details">


                                                    <span className="bundle-service-label">

                                                        SERVICE

                                                        {" "}

                                                        {
                                                            index + 1
                                                        }

                                                    </span>


                                                    <h3>

                                                        {
                                                            service?.serviceName ||
                                                            "Service"
                                                        }

                                                    </h3>


                                                    {
                                                        service?.businessName && (

                                                            <p className="bundle-business-name">

                                                                {
                                                                    service.businessName
                                                                }

                                                            </p>

                                                        )
                                                    }


                                                    {
                                                        service?.city && (

                                                            <p className="bundle-location">

                                                                📍

                                                                {" "}

                                                                {
                                                                    service.city
                                                                }

                                                            </p>

                                                        )
                                                    }


                                                    {
                                                        service && (

                                                            <div className="bundle-service-meta">

                                                                <span>

                                                                    ⭐

                                                                    {" "}

                                                                    {
                                                                        service.rating ??
                                                                        0
                                                                    }

                                                                </span>


                                                                {
                                                                    (
                                                                        service.reviewCount ??
                                                                        0
                                                                    ) > 0 && (

                                                                        <span>

                                                                            (

                                                                            {
                                                                                service.reviewCount
                                                                            }

                                                                            {" reviews)"}

                                                                        </span>

                                                                    )
                                                                }

                                                            </div>

                                                        )

                                                    }


                                                </div>


                                                {/* PRICE */}

                                                <div className="bundle-service-price">


                                                    {
                                                        service && (

                                                            <strong>

                                                                ₹

                                                                {
                                                                    Number(
                                                                        service.startingPrice ??
                                                                        0
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )
                                                                }

                                                            </strong>

                                                        )

                                                    }


                                                    <span>

                                                        Starting price

                                                    </span>

                                                </div>


                                                {/* ACTION */}

                                                <div className="bundle-service-action">


                                                    {
                                                        alreadyAdded ? (

                                                            <span className="bundle-added-status">

                                                                ✓ Added to Cart

                                                            </span>

                                                        ) : (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOpenService(
                                                                        id
                                                                    )
                                                                }
                                                            >

                                                                View Details

                                                                <span>

                                                                    →

                                                                </span>

                                                            </button>

                                                        )
                                                    }


                                                </div>


                                            </div>

                                        );

                                    }
                                )

                            )
                        }


                    </div>


                    {/* =================================
                        EMPTY API FALLBACK
                    ================================= */}

                    {
                        !servicesLoading &&

                        availableServices.length === 0 && (

                            <p className="bundle-service-note">

                                Service details could not be
                                loaded, but you can still open
                                each service using the available
                                bundle actions.

                            </p>

                        )
                    }


                    {/* =================================
                        COMPLETION
                    ================================= */}

                    {
                        allServicesAdded && (

                            <div className="bundle-complete">

                                <div className="bundle-complete-icon">

                                    ✓

                                </div>


                                <div>

                                    <h3>

                                        Bundle Complete!

                                    </h3>


                                    <p>

                                        All services in this bundle
                                        have been added to your cart.
                                        Your bundle is ready for
                                        checkout.

                                    </p>

                                </div>

                            </div>

                        )

                    }


                    {/* =================================
                        FOOTER ACTIONS
                    ================================= */}

                    <div className="bundle-page-actions">


                        <p>

                            {
                                allServicesAdded

                                    ? "Your bundle is complete and ready for checkout."

                                    : "Complete all services to unlock your bundle discount."
                            }

                        </p>


                        <div className="bundle-action-buttons">


                            {
                                allServicesAdded && (

                                    <button
                                        type="button"
                                        className="bundle-checkout-button"
                                        onClick={
                                            handleGoToCart
                                        }
                                    >

                                        Go to Cart & Checkout

                                    </button>

                                )
                            }


                            <button
                                type="button"
                                className="switch-bundle-button"
                                onClick={
                                    handleSwitchBundle
                                }
                            >

                                Switch Bundle

                            </button>


                            <button
                                type="button"
                                className="cancel-bundle-button"
                                onClick={
                                    handleGoToCart
                                }
                            >

                                Cancel & Go to Cart

                            </button>


                        </div>


                    </div>


                </section>


            </div>


            {/* =========================================
                SWITCH BUNDLE MODAL
            ========================================= */}

            {
                showSwitchPopup && (

                    <div className="bundle-modal-overlay">


                        <div className="bundle-modal">


                            <h2>

                                Switch Bundle?

                            </h2>


                            <p>

                                You are currently building{" "}

                                <strong>

                                    {bundle.name}

                                </strong>.

                            </p>


                            {
                                cartServiceIds.some(

                                    id =>

                                        bundle.serviceIds.includes(
                                            id
                                        )

                                ) && (

                                    <p>

                                        Some services from this
                                        bundle have already been
                                        added to your cart.

                                        <br />

                                        <br />

                                        If you switch bundles, your
                                        existing cart items will remain
                                        in the cart, but the current
                                        bundle discount will not apply
                                        to partially completed bundles.

                                    </p>

                                )

                            }


                            <p>

                                Do you want to continue and
                                choose another bundle?

                            </p>


                            <div className="bundle-modal-actions">


                                <button
                                    type="button"
                                    className="bundle-modal-confirm"
                                    onClick={
                                        confirmSwitchBundle
                                    }
                                >

                                    Yes, Switch Bundle

                                </button>


                                <button
                                    type="button"
                                    className="bundle-modal-cancel"
                                    onClick={
                                        cancelSwitchBundle
                                    }
                                >

                                    No, Stay With This Bundle

                                </button>


                            </div>


                        </div>


                    </div>

                )

            }


        </div>

    );

};


export default BundleSelection;