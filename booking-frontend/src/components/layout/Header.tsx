import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import CartService from "../../services/CartService";

import "./Header.css";


const Header = () => {

    const {
        user,
        isAuthenticated,
        logout
    } = useAuth();

    const navigate = useNavigate();

    /*
     * =========================================
     * CART COUNT
     * =========================================
     */

    const [
        cartCount,
        setCartCount
    ] = useState(
        CartService.getItemCount()
    );


    /*
     * =========================================
     * LISTEN FOR CART CHANGES
     * =========================================
     */

    useEffect(() => {

        const updateCartCount = () => {

            setCartCount(
                CartService.getItemCount()
            );

        };


        /*
         * Update immediately when another
         * component changes the cart.
         */

        window.addEventListener(
            "cartUpdated",
            updateCartCount
        );


        /*
         * Also refresh when user returns
         * to the browser/tab.
         */

        window.addEventListener(
            "storage",
            updateCartCount
        );


        return () => {

            window.removeEventListener(
                "cartUpdated",
                updateCartCount
            );

            window.removeEventListener(
                "storage",
                updateCartCount
            );

        };

    }, []);


    return (

        <>

            <div className="top-bar">

                <div className="container top-container">


                    <div className="top-location">

                        🇮🇳 India ▼

                        &nbsp;&nbsp;

                        ₹ INR ▼

                    </div>


                    <div className="header-actions">


                        <Link to="/help">
                            Help
                        </Link>


                        {isAuthenticated && user ? (

                            <>

                                {/* =================================
                                    CART
                                ================================= */}

                                <button
                                    type="button"
                                    className="header-cart-button"
                                    onClick={() =>
                                        navigate("/cart")
                                    }
                                    title="View Cart"
                                >

                                    <span className="header-cart-icon">
                                        🛒
                                    </span>

                                    <span>
                                        Cart
                                    </span>

                                    <span className="header-cart-badge">
                                        {cartCount}
                                    </span>

                                </button>


                                {/* =================================
                                    NOTIFICATION
                                ================================= */}

                                <button
                                    className="notification-btn"
                                    title="Notifications"
                                >

                                    🔔

                                    <span className="notification-badge">
                                        0
                                    </span>

                                </button>


                                {/* =================================
                                    USER PROFILE
                                ================================= */}

                                <div className="user-profile">

                                    <span className="user-avatar">
                                        👤
                                    </span>


                                    <div className="user-details">

                                        <span className="user-name">
                                            {user.name || "User"}
                                        </span>


                                        <span className="user-role">
                                            {user.role}
                                        </span>

                                    </div>

                                </div>


                                {/* =================================
                                    VENDOR DASHBOARD
                                ================================= */}

                                {user.role === "VENDOR" && (

                                    <Link
                                        to="/vendor/dashboard"
                                        className="header-dashboard-link"
                                    >
                                        Dashboard
                                    </Link>

                                )}


                                {/* =================================
                                    ADMIN DASHBOARD
                                ================================= */}

                                {user.role === "ADMIN" && (

                                    <Link
                                        to="/admin/dashboard"
                                        className="header-dashboard-link"
                                    >
                                        Dashboard
                                    </Link>

                                )}


                                {/* =================================
                                    LOGOUT
                                ================================= */}

                                <button
                                    className="logout-btn"
                                    onClick={() => {
                                        logout();
                                        navigate("/");
                                    }}
                                >
                                    Logout
                                </button>

                            </>

                        ) : (

                            <>

                                <Link to="/login">

                                    <button
                                        className="login-btn"
                                    >
                                        Login
                                    </button>

                                </Link>


                                <Link to="/register">

                                    <button
                                        className="register-btn"
                                    >
                                        Register
                                    </button>

                                </Link>

                            </>

                        )}

                    </div>

                </div>

            </div>


            {/* =========================================
                MAIN HEADER
            ========================================= */}

            <header className="main-header">

                <div className="container header-container">


                    <Link
                        to="/"
                        className="logo"
                    >

                        🎉 EventNest

                    </Link>


                    <nav className="desktop-menu">


                        <Link to="/">
                            Home
                        </Link>


                        <Link to="/categories?category=HALL">
                            Halls
                        </Link>


                        <Link to="/categories?category=PHOTOGRAPHY">
                            Photography
                        </Link>


                        <Link to="/categories?category=MAKEUP">
                            Makeup
                        </Link>


                        {user?.role === "CUSTOMER" && (

                            <Link to="/customer/bookings">
                                My Bookings
                            </Link>

                        )}

                    </nav>


                </div>

            </header>

        </>

    );

};


export default Header;