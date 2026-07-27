import {
    FaBell,
    FaSearch,
    FaChevronDown,
    FaUser,
    FaCog,
    FaSignOutAlt
} from "react-icons/fa";

import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../../../../context/AuthContext";

import "./VendorTopbar.css";


export default function VendorTopbar() {

    const {
        user,
        logout
    } = useAuth();

    const navigate = useNavigate();

    const profileRef =
        useRef<HTMLDivElement>(null);

    const [
        profileMenuOpen,
        setProfileMenuOpen
    ] = useState(false);


    /*
     * Current date
     */
    const today =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    /*
     * Vendor name
     */
    const vendorName =
        user?.name || "Vendor";


    /*
     * Avatar initials
     */
    const avatar =
        vendorName
            .split(" ")
            .filter(Boolean)
            .map(word => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();


    /*
     * Close profile dropdown
     * when clicking outside.
     */
    useEffect(() => {

        function handleOutsideClick(
            event: MouseEvent
        ) {

            if (

                profileRef.current &&

                !profileRef.current.contains(
                    event.target as Node
                )

            ) {

                setProfileMenuOpen(false);

            }

        }


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    /*
     * Handle Sign Out
     */
    const handleLogout = () => {

        setProfileMenuOpen(false);

        logout();

        navigate("/");

    };


    /*
     * Toggle profile dropdown
     */
    const toggleProfileMenu = () => {

        setProfileMenuOpen(
            previous => !previous
        );

    };


    return (

        <header className="vendor-topbar">


            {/* =================================
                LEFT
            ================================= */}

            <div className="topbar-left">

                <h2>
                    Dashboard
                </h2>

                <span>
                    {today}
                </span>

            </div>



            {/* =================================
                CENTER
            ================================= */}

            <div className="topbar-center">

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search bookings, customers..."
                    />

                </div>

            </div>



            {/* =================================
                RIGHT
            ================================= */}

            <div className="topbar-right">


                {/* Notification */}

                <button
                    className="notification-btn"
                    type="button"
                >

                    <FaBell />

                    <span className="badge">
                        3
                    </span>

                </button>



                {/* =================================
                    PROFILE
                ================================= */}

                <div
                    className="profile-wrapper"
                    ref={profileRef}
                >


                    {/* Profile Trigger */}

                    <button
                        type="button"
                        className={

                            `profile-box ${
                                profileMenuOpen
                                    ? "profile-box-active"
                                    : ""
                            }`

                        }
                        onClick={
                            toggleProfileMenu
                        }
                    >


                        {/* Avatar */}

                        <div className="avatar">

                            {avatar}

                        </div>



                        {/* User Details */}

                        <div className="profile-details">

                            <h4>
                                {vendorName}
                            </h4>

                            <span>
                                Vendor
                            </span>

                        </div>



                        {/* Chevron */}

                        <FaChevronDown
                            className={

                                profileMenuOpen
                                    ? "chevron-open"
                                    : ""

                            }
                        />

                    </button>



                    {/* =================================
                        DROPDOWN MENU
                    ================================= */}

                    {

                        profileMenuOpen && (

                            <div className="profile-dropdown">


                                {/* Profile */}

                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {

                                        setProfileMenuOpen(
                                            false
                                        );

                                        /*
                                         * Add vendor profile
                                         * navigation later.
                                         */

                                    }}
                                >

                                    <div className="dropdown-icon">

                                        <FaUser />

                                    </div>


                                    <div className="dropdown-content">

                                        <strong>
                                            My Profile
                                        </strong>

                                        <span>
                                            View and edit your profile
                                        </span>

                                    </div>

                                </button>



                                {/* Divider */}

                                <div className="dropdown-divider" />



                                {/* Settings */}

                                <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {

                                        setProfileMenuOpen(
                                            false
                                        );

                                        /*
                                         * Add settings
                                         * navigation later.
                                         */

                                    }}
                                >

                                    <div className="dropdown-icon">

                                        <FaCog />

                                    </div>


                                    <div className="dropdown-content">

                                        <strong>
                                            Account Settings
                                        </strong>

                                        <span>
                                            Manage your preferences
                                        </span>

                                    </div>

                                </button>



                                {/* Divider */}

                                <div className="dropdown-divider" />



                                {/* Sign Out */}

                                <button
                                    type="button"
                                    className="dropdown-item logout-item"
                                    onClick={
                                        handleLogout
                                    }
                                >

                                    <div className="dropdown-icon logout-icon">

                                        <FaSignOutAlt />

                                    </div>


                                    <div className="dropdown-content">

                                        <strong>
                                            Sign Out
                                        </strong>

                                        <span>
                                            Logout from your account
                                        </span>

                                    </div>

                                </button>


                            </div>

                        )

                    }


                </div>


            </div>


        </header>

    );

}