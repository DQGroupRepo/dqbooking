import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import CartService from "../../services/CartService";
import type { CartItem } from "../../types/CartItem";

import "./Cart.css";


const Cart = () => {

    const navigate =
        useNavigate();


    const [cart, setCart] =
        useState<CartItem[]>([]);


    useEffect(() => {

        const updateCart = () => {

            setCart(
                CartService.getCart()
            );

        };


        /*
         * Load cart initially.
         */

        updateCart();


        /*
         * Listen for cart updates
         * in the current tab.
         */

        window.addEventListener(
            "cartUpdated",
            updateCart
        );


        /*
         * Listen for changes from
         * another browser tab.
         */

        window.addEventListener(
            "storage",
            updateCart
        );


        return () => {

            window.removeEventListener(
                "cartUpdated",
                updateCart
            );


            window.removeEventListener(
                "storage",
                updateCart
            );

        };

    }, []);


    /*
     * =========================================
     * CALCULATIONS
     * =========================================
     */

    const subtotal =
        CartService.getSubtotal();


    const totalDiscount =
        CartService.getTotalDiscount();


    const finalTotal =
        CartService.getFinalTotal();


    /*
     * =========================================
     * BUNDLES
     * =========================================
     */

    const cartBundles =
        CartService.getCartBundles();


    const bundleIds =
        new Set(
            cartBundles.map(
                bundle =>
                    bundle.bundleId
            )
        );


    /*
     * =========================================
     * NORMAL SERVICES
     * =========================================
     */

    const normalItems =
        cart.filter(
            item =>
                !item.bundleId
        );


    /*
     * =========================================
     * REMOVE SERVICE
     * =========================================
     */

    const handleRemove = async (
        serviceId: string
    ) => {

        const updatedCart =
            await CartService.removeItem(
                serviceId
            );

        setCart(updatedCart);
    };


    /*
     * =========================================
     * CLEAR CART
     * =========================================
     */

    const handleClearCart = async () => {

        const confirmed = window.confirm(
            "Clear your cart? All selected services will be removed and their active booking holds will be released."
        );

        if (!confirmed) {
            return;
        }

        setCart([]);
        await CartService.clearCart();
    };


    /*
     * =========================================
     * CHECKOUT
     * =========================================
     */

    const handleCheckout = () => {

        if (
            cart.length === 0
        ) {

            return;

        }


        navigate(
            "/checkout",
            {
                state: {
                    cart
                }
            }
        );

    };


    /*
     * =========================================
     * RENDER BUNDLE
     * =========================================
     */

    const renderBundle =
        (
            bundle: CartItem
        ) => {

            const bundleItems =
                cart.filter(
                    item =>
                        item.bundleId ===
                        bundle.bundleId
                );


            const originalPrice =
                bundleItems.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        Number(
                            item.price
                        ),
                    0
                );


            const isComplete =
                CartService.isBundleComplete(
                    bundle.bundleId!
                );


            const discount =
                CartService.getBundleDiscount(
                    bundle.bundleId!
                );


            const finalPrice =
                originalPrice -
                discount;


            const requiredCount =
                bundle.bundleServiceIds
                    ?.length ||
                bundleItems.length;

            const completedCount =
                bundle.bundleServiceIds?.filter(
                    requiredServiceId =>
                        bundleItems.some(
                            item => item.serviceId === requiredServiceId
                        )
                ).length ?? bundleItems.length;


            return (

                <div
                    className="cart-bundle"
                    key={
                        bundle.bundleId
                    }
                >

                    {/* =================================
                        BUNDLE HEADER
                    ================================= */}

                    <div className="cart-bundle-header">

                        <div className="cart-bundle-info">

                            <h2>
                                {
                                    bundle.bundleName ||
                                    "Selected Bundle"
                                }
                            </h2>


                            <p
                                className={
                                    isComplete
                                        ? "cart-bundle-status completed"
                                        : "cart-bundle-status pending"
                                }
                            >

                                {
                                    isComplete
                                        ? "✓ Bundle completed"
                                        : `Bundle in progress — ${completedCount} of ${requiredCount} services selected`
                                }

                            </p>

                            {
                                !isComplete && (

                                    <button
                                        type="button"
                                        className="cart-bundle-resume-button"
                                        style={{
                                            marginTop: "0.75rem",
                                            padding: "0.55rem 0.9rem",
                                            borderRadius: "8px",
                                            border: "1px solid currentColor",
                                            background: "transparent",
                                            cursor: "pointer",
                                            fontWeight: 600
                                        }}
                                        onClick={() => {
                                            const rootServiceId =
                                                bundle.bundleServiceIds?.[0] ||
                                                bundleItems[0]?.serviceId;

                                            if (!rootServiceId) {
                                                return;
                                            }

                                            navigate(
                                                `/bundles/available/${rootServiceId}`,
                                                {
                                                    state: {
                                                        fromBundle: true,
                                                        bundleRootServiceId: rootServiceId,
                                                        bundleId: bundle.bundleId,
                                                        bundleName: bundle.bundleName,
                                                        bundleDescription: bundle.bundleDescription,
                                                        bundleServiceIds: bundle.bundleServiceIds,
                                                        bundleDiscountType: bundle.bundleDiscountType,
                                                        bundleDiscountValue: bundle.bundleDiscountValue
                                                    }
                                                }
                                            );
                                        }}
                                    >
                                        Continue Bundle
                                    </button>

                                )
                            }

                        </div>


                        {
                            bundle.bundleDiscountType && (

                                <div className="cart-bundle-discount">

                                    Save{" "}

                                    {
                                        bundle.bundleDiscountType ===
                                        "PERCENTAGE"

                                            ? `${bundle.bundleDiscountValue}%`

                                            : `₹${Number(
                                                bundle.bundleDiscountValue ||
                                                0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}`

                                    }

                                </div>

                            )
                        }

                    </div>


                    {/* =================================
                        BUNDLE SERVICES
                    ================================= */}

                    <div className="cart-bundle-items">

                        {
                            bundleItems.map(
                                item => (

                                    <div
                                        key={
                                            item.serviceId
                                        }
                                        className="cart-item"
                                    >

                                        <div className="cart-item-image">

                                            {
                                                item.image ? (

                                                    <img
                                                        src={
                                                            item.image
                                                        }
                                                        alt={
                                                            item.serviceName
                                                        }
                                                    />

                                                ) : (

                                                    <span>
                                                        📦
                                                    </span>

                                                )
                                            }

                                        </div>


                                        <div className="cart-item-details">

                                            <h3>
                                                {
                                                    item.serviceName
                                                }
                                            </h3>


                                            <p className="cart-vendor-name">

                                                {
                                                    item.vendorName
                                                }

                                            </p>


                                            {
                                                item.category && (

                                                    <span className="cart-item-category">

                                                        {
                                                            item.category
                                                        }

                                                    </span>

                                                )
                                            }


                                            <div className="cart-item-meta">

                                                {
                                                    item.eventDate && (

                                                        <span>

                                                            📅 Event Date:{" "}

                                                            {
                                                                item.eventDate
                                                            }

                                                        </span>

                                                    )
                                                }


                                                {
                                                    item.guestCount && (

                                                        <span>

                                                            👥 Guests:{" "}

                                                            {
                                                                item.guestCount
                                                            }

                                                        </span>

                                                    )
                                                }

                                            </div>

                                        </div>


                                        <div className="cart-item-price">

                                            <strong>

                                                ₹
                                                {
                                                    Number(
                                                        item.price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )
                                                }

                                            </strong>

                                        </div>


                                        <button
                                            type="button"
                                            className="cart-remove-button"
                                            onClick={() =>
                                                handleRemove(
                                                    item.serviceId
                                                )
                                            }
                                            aria-label={
                                                `Remove ${item.serviceName}`
                                            }
                                        >
                                            ×
                                        </button>

                                    </div>

                                )
                            )
                        }

                    </div>


                    {/* =================================
                        BUNDLE CALCULATION
                    ================================= */}

                    <div className="cart-bundle-calculation">

                        <div>

                            <span>
                                Original bundle services
                            </span>

                            <span>

                                ₹
                                {
                                    originalPrice.toLocaleString(
                                        "en-IN"
                                    )
                                }

                            </span>

                        </div>


                        {
                            isComplete ? (

                                <>

                                    <div className="cart-discount-row">

                                        <span>
                                            Bundle Discount
                                        </span>

                                        <span>
                                            - ₹
                                            {
                                                discount.toLocaleString(
                                                    "en-IN"
                                                )
                                            }
                                        </span>

                                    </div>


                                    <div className="cart-bundle-final">

                                        <strong>
                                            Bundle Total
                                        </strong>

                                        <strong>

                                            ₹
                                            {
                                                finalPrice.toLocaleString(
                                                    "en-IN"
                                                )
                                            }

                                        </strong>

                                    </div>

                                </>

                            ) : (

                                <p className="cart-bundle-pending">

                                    Complete all services in this
                                    bundle to receive the bundle
                                    discount.

                                </p>

                            )
                        }

                    </div>

                </div>

            );

        };


    return (

        <section className="cart-page">

            {/* =====================================
                HEADER
            ===================================== */}

            <div className="cart-header">

                <div>

                    <h1>
                        Your Cart
                    </h1>

                    <p>
                        Review your selected services
                        before checkout.
                    </p>

                </div>


                {
                    cart.length > 0 && (

                        <button
                            type="button"
                            className="cart-clear-button"
                            onClick={
                                handleClearCart
                            }
                        >
                            🗑 Clear Cart
                        </button>

                    )
                }

            </div>


            {
                cart.length === 0 ? (

                    <div className="cart-empty-state">

                        <div className="cart-empty-icon">
                            🛒
                        </div>

                        <h2>
                            Your cart is empty
                        </h2>

                        <p>
                            Select a service from EventNest
                            to get started.
                        </p>

                        <Link
                            to="/"
                            className="cart-browse-button"
                        >
                            Browse Services
                        </Link>

                    </div>

                ) : (

                    <div className="cart-layout">

                        {/* =================================
                            CART ITEMS
                        ================================= */}

                        <div className="cart-items">


                            {/* =================================
                                BUNDLES
                            ================================= */}

                            {
                                cartBundles.map(
                                    bundle =>
                                        renderBundle(
                                            bundle
                                        )
                                )
                            }


                            {/* =================================
                                NORMAL SERVICES
                            ================================= */}

                            {
                                normalItems.length > 0 && (

                                    <div className="cart-normal-services">


                                        {
                                            cartBundles.length > 0 && (

                                                <div className="cart-section-header">

                                                    <div>

                                                        <h2>
                                                            Individual Services
                                                        </h2>

                                                        <p>
                                                            Services selected
                                                            outside your bundle.
                                                        </p>

                                                    </div>

                                                </div>

                                            )
                                        }


                                        {
                                            normalItems.map(
                                                item => (

                                                    <div
                                                        key={
                                                            item.serviceId
                                                        }
                                                        className="cart-item"
                                                    >

                                                        <div className="cart-item-image">

                                                            {
                                                                item.image ? (

                                                                    <img
                                                                        src={
                                                                            item.image
                                                                        }
                                                                        alt={
                                                                            item.serviceName
                                                                        }
                                                                    />

                                                                ) : (

                                                                    <span>
                                                                        📦
                                                                    </span>

                                                                )
                                                            }

                                                        </div>


                                                        <div className="cart-item-details">

                                                            <h3>

                                                                {
                                                                    item.serviceName
                                                                }

                                                            </h3>


                                                            <p className="cart-vendor-name">

                                                                {
                                                                    item.vendorName
                                                                }

                                                            </p>


                                                            {
                                                                item.category && (

                                                                    <span className="cart-item-category">

                                                                        {
                                                                            item.category
                                                                        }

                                                                    </span>

                                                                )
                                                            }


                                                            <div className="cart-item-meta">

                                                                {
                                                                    item.eventDate && (

                                                                        <span>

                                                                            📅 Event Date:{" "}

                                                                            {
                                                                                item.eventDate
                                                                            }

                                                                        </span>

                                                                    )
                                                                }


                                                                {
                                                                    item.guestCount && (

                                                                        <span>

                                                                            👥 Guests:{" "}

                                                                            {
                                                                                item.guestCount
                                                                            }

                                                                        </span>

                                                                    )
                                                                }

                                                            </div>

                                                        </div>


                                                        <div className="cart-item-price">

                                                            <strong>

                                                                ₹
                                                                {
                                                                    Number(
                                                                        item.price
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )
                                                                }

                                                            </strong>

                                                        </div>


                                                        <button
                                                            type="button"
                                                            className="cart-remove-button"
                                                            onClick={() =>
                                                                handleRemove(
                                                                    item.serviceId
                                                                )
                                                            }
                                                            aria-label={
                                                                `Remove ${item.serviceName}`
                                                            }
                                                        >
                                                            ×
                                                        </button>

                                                    </div>

                                                )
                                            )
                                        }

                                    </div>

                                )
                            }

                        </div>


                        {/* =================================
                            ORDER SUMMARY
                        ================================= */}

                        <aside className="cart-summary">

                            <h2>
                                Order Summary
                            </h2>


                            <div className="cart-summary-row">

                                <span>
                                    Services
                                </span>

                                <span>
                                    {
                                        cart.length
                                    }
                                </span>

                            </div>


                            <div className="cart-summary-row">

                                <span>
                                    Original Subtotal
                                </span>

                                <strong>

                                    ₹
                                    {
                                        subtotal.toLocaleString(
                                            "en-IN"
                                        )
                                    }

                                </strong>

                            </div>


                            {
                                totalDiscount > 0 && (

                                    <div className="cart-summary-row cart-summary-discount">

                                        <span>
                                            Bundle Discount
                                        </span>

                                        <strong>

                                            - ₹
                                            {
                                                totalDiscount.toLocaleString(
                                                    "en-IN"
                                                )
                                            }

                                        </strong>

                                    </div>

                                )
                            }


                            <div className="cart-summary-divider" />


                            <div className="cart-summary-total">

                                <span>
                                    Total
                                </span>

                                <strong>

                                    ₹
                                    {
                                        finalTotal.toLocaleString(
                                            "en-IN"
                                        )
                                    }

                                </strong>

                            </div>


                            {
                                totalDiscount > 0 && (

                                    <p className="cart-savings-message">

                                        🎉 You save ₹
                                        {
                                            totalDiscount.toLocaleString(
                                                "en-IN"
                                            )
                                        } with your bundle!

                                    </p>

                                )
                            }


                            <button
                                type="button"
                                className="cart-checkout-button"
                                onClick={
                                    handleCheckout
                                }
                            >
                                🛒 Proceed to Checkout
                            </button>

                        </aside>

                    </div>

                )
            }

        </section>

    );

};


export default Cart;