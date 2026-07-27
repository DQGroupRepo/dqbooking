import {
    Link
} from "react-router-dom";

import {
    useAuth
} from "../../context/AuthContext";

import "./Header.css";


const Header = () => {


    const {
        user,
        isAuthenticated,
        logout
    } = useAuth();


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

                                {/* Notification */}

                                <button
                                    className="notification-btn"
                                    title="Notifications"
                                >

                                    🔔

                                    <span className="notification-badge">
                                        0
                                    </span>

                                </button>


                                {/* User Profile */}

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


                                {/* Vendor Dashboard */}

                                {user.role === "VENDOR" && (

                                    <Link
                                        to="/vendor/dashboard"
                                        className="header-dashboard-link"
                                    >
                                        Dashboard
                                    </Link>

                                )}


                                {/* Admin */}

                                {user.role === "ADMIN" && (

                                    <Link
                                        to="/admin/dashboard"
                                        className="header-dashboard-link"
                                    >
                                        Admin
                                    </Link>

                                )}


                                {/* Logout */}

                                <button
                                    className="logout-btn"
                                    onClick={logout}
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

                            <Link to="/bookings">
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