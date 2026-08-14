import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import BundleService from "../../services/BundleService";
import CartService from "../../services/CartService";

import type { Bundle } from "../../types/Bundle";

import "./BundleSelection.css";


interface BundleNavigationState {

    fromBundle?: boolean;

    bundleId?: string;

    bundleRootServiceId?: string;

    bundleName?: string;

    bundleDescription?: string;

    bundleServiceIds?: string[];

    bundleDiscountType?:
        "PERCENTAGE" | "FIXED";

    bundleDiscountValue?: number;

}


const BundleSelection = () => {

    const { serviceId } = useParams();

    const navigate =
        useNavigate();

    const location =
        useLocation();


    const navigationState =
        location.state as
        BundleNavigationState | null;


    const [bundle, setBundle] =
        useState<Bundle | null>(null);


    const [loading, setLoading] =
        useState(true);


    /*
     * =========================================
     * CART STATE
     * =========================================
     */

    const [cartServiceIds, setCartServiceIds] =
        useState<string[]>([]);


    /*
     * =========================================
     * SWITCH BUNDLE POPUP
     * =========================================
     */

    const [showSwitchPopup, setShowSwitchPopup] =
        useState(false);


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


    useEffect(() => {

        refreshCart();

    }, []);


    /*
     * =========================================
     * LOAD SELECTED BUNDLE
     * =========================================
     */

    useEffect(() => {

        if (!serviceId) {
            return;
        }

        loadBundle(serviceId);

    }, [serviceId]);


    const loadBundle = async (
        rootServiceId: string
    ) => {

        try {

            setLoading(true);


            /*
             * =========================================
             * CASE 1
             * Bundle passed through navigation
             * =========================================
             */

            if (
                navigationState?.bundleId &&
                navigationState?.bundleServiceIds
            ) {

                const selectedBundle: Bundle = {

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

                    active: true

                };


                setBundle(
                    selectedBundle
                );

                return;

            }


            /*
             * =========================================
             * CASE 2
             * Direct bundle URL
             * =========================================
             */

            const bundles =
                await BundleService
                    .getBundlesForService(
                        rootServiceId
                    );


            /*
             * One bundle = automatically select it.
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
             * Multiple bundles without a selected
             * bundle.
             */

            if (
                bundles.length > 1
            ) {

                /*
                 * Go back to the service page and
                 * allow VendorBookingCard to display
                 * the bundle selection popup.
                 */

                navigate(
                    `/vendor/${rootServiceId}`,
                    {
                        state: {
                            openBundlePopup: true
                        }
                    }
                );

                return;

            }


            setBundle(null);

        } catch (error) {

            console.error(
                "Failed to load selected bundle:",
                error
            );

            setBundle(null);

        } finally {

            setLoading(false);

        }

    };


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
        remainingServiceIds.length === 0;


    /*
     * =========================================
     * OPEN SERVICE DETAILS
     * =========================================
     */

    const handleOpenService = (
        nextServiceId: string
    ) => {

        if (!bundle) {
            return;
        }


        navigate(
            `/vendor/${nextServiceId}`,
            {
                state: {

                    fromBundle: true,

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

    const handleGoToCart = () => {

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

            /*
             * If everything is already completed,
             * there is no reason to warn about losing
             * a partial bundle.
             */

            if (
                allServicesAdded
            ) {

                navigate(
                    `/vendor/${serviceId}`,
                    {
                        state: {
                            openBundlePopup: true
                        }
                    }
                );

                return;

            }


            /*
             * Show confirmation before switching.
             */

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


            /*
             * We intentionally do NOT remove cart
             * items here.
             *
             * The cart remains intact.
             *
             * The bundle discount is not applied to
             * partially selected services.
             *
             * The customer can now select another bundle.
             */

            if (!serviceId) {

                navigate(
                    "/cart"
                );

                return;

            }


            navigate(
                `/vendor/${serviceId}`,
                {
                    state: {
                        openBundlePopup: true
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

    if (loading) {

        return (

            <div className="bundle-selection-page">

                <div className="bundle-selection-container">

                    <h2>
                        Loading bundle...
                    </h2>

                </div>

            </div>

        );

    }


    /*
     * =========================================
     * NO BUNDLE
     * =========================================
     */

    if (!bundle) {

        return (

            <div className="bundle-selection-page">

                <div className="bundle-selection-container">

                    <h2>
                        Bundle not found
                    </h2>


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


                {/* =========================================
                    HEADER
                   ========================================= */}

                <div className="bundle-selection-header">

                    <h1>
                        {bundle.name}
                    </h1>


                    {
                        bundle.description && (

                            <p>
                                {bundle.description}
                            </p>

                        )
                    }


                    <div className="bundle-discount">

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

                    </div>

                </div>


                {/* =========================================
                    SERVICES
                   ========================================= */}

                <div className="bundle-card">

                    <div className="bundle-card-header">

                        <div>

                            <h2>
                                Services Included
                            </h2>

                            <p>
                                Select a service to view
                                its details.
                            </p>

                        </div>

                    </div>


                    <div className="bundle-services">

                        <div className="bundle-service-list">

                            {
                                bundle.serviceIds.map(
                                    id => {

                                        const alreadyAdded =
                                            cartServiceIds.includes(
                                                id
                                            );


                                        return (

                                            <button
                                                key={id}
                                                type="button"
                                                className={
                                                    alreadyAdded
                                                        ? "bundle-service already-added"
                                                        : "bundle-service"
                                                }
                                                onClick={() =>
                                                    !alreadyAdded &&
                                                    handleOpenService(
                                                        id
                                                    )
                                                }
                                                disabled={
                                                    alreadyAdded
                                                }
                                            >

                                                <span>
                                                    Service
                                                </span>


                                                <span>
                                                    {id}
                                                </span>


                                                {
                                                    alreadyAdded && (

                                                        <span className="service-status">

                                                            ✓ Added

                                                        </span>

                                                    )
                                                }


                                                {
                                                    !alreadyAdded && (

                                                        <span className="service-status">

                                                            View Details →

                                                        </span>

                                                    )
                                                }

                                            </button>

                                        );

                                    }
                                )
                            }

                        </div>

                    </div>


                    {/* =========================================
                        COMPLETION
                       ========================================= */}

                    {
                        allServicesAdded && (

                            <div className="bundle-complete">

                                <h3>
                                    🎉 Bundle Complete
                                </h3>

                                <p>
                                    All services in this
                                    bundle have been added
                                    to your cart.
                                </p>

                            </div>

                        )
                    }


                    {/* =========================================
                        ACTIONS
                       ========================================= */}

                    <div className="bundle-page-actions">

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
                            Cancel Bundle & Go to Cart
                        </button>

                    </div>

                </div>

            </div>


            {/* =========================================
                SWITCH BUNDLE CONFIRMATION
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

                                        If you switch to another
                                        bundle, the current bundle
                                        discount will not be applied
                                        to these partially selected
                                        services.

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
                                    onClick={
                                        confirmSwitchBundle
                                    }
                                >
                                    Yes, Switch Bundle
                                </button>


                                <button
                                    type="button"
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