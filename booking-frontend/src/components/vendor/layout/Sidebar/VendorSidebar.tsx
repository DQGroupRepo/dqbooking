import { NavLink } from "react-router-dom";

import {
    FaHome,
    FaChartPie,
    FaPlusCircle,
    FaConciergeBell,
    FaCalendarAlt,
    FaStar,
    FaCog,
    FaChartLine,
    FaLayerGroup,
    FaUsers
} from "react-icons/fa";

import { useAuth } from "../../../../context/AuthContext";

import "./VendorSidebar.css";


interface VendorSidebarProps {

    viewPages: string[];

    supportActive?: boolean;

}


const vendorMenu = [

    {
        label: "Home",
        path: "/",
        icon: <FaHome />,
        page: null
    },

    {
        label: "Dashboard",
        path: "/vendor/dashboard",
        icon: <FaChartPie />,
        page: "DASHBOARD"
    },

    {
        label: "Create Listing",
        path: "/vendor/create-listing",
        icon: <FaPlusCircle />,
        page: "SERVICES"
    },

    {
        label: "Services",
        path: "/vendor/manage-services",
        icon: <FaConciergeBell />,
        page: "SERVICES"
    },

    {
        label: "Bundles",
        path: "/vendor/bundles",
        icon: <FaLayerGroup />,
        page: "BUNDLES"
    },

    {
        label: "Bookings",
        path: "/vendor/bookings",
        icon: <FaCalendarAlt />,
        page: "BOOKINGS"
    },

    {
        label: "Reviews",
        path: "/vendor/reviews",
        icon: <FaStar />,
        page: "REVIEWS"
    },

    {
        label: "Revenue",
        path: "/vendor/revenue",
        icon: <FaChartLine />,
        page: "REVENUE"
    },

    {
        label: "Settings",
        path: "/vendor/settings",
        icon: <FaCog />,
        page: "SETTINGS"
    }

];


export default function VendorSidebar({

    viewPages,

    supportActive = false

}: VendorSidebarProps) {


    const {
        user
    } = useAuth();


    /*
     * =========================================
     * TEAM ACCESS
     * =========================================
     *
     * Team is a VendorAdmin management function.
     *
     * VendorUser does not get Team access.
     *
     * ADMIN gets Team access only while
     * Support Mode is active.
     */

    const canManageTeam =
        user?.role === "VENDOR_ADMIN" ||
        (
            user?.role === "ADMIN" &&
            supportActive
        );


    return (

        <aside className="vendor-sidebar">


            {/* =====================================================
                LOGO
            ===================================================== */}

            <div className="vendor-logo">

                <span className="logo-icon">
                    🎉
                </span>


                <div>

                    <h2>
                        EventNest
                    </h2>


                    <p>
                        Vendor Portal
                    </p>

                </div>

            </div>


            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <nav>

                {
                    vendorMenu

                        .filter(
                            item =>

                                item.page === null ||

                                viewPages.includes(
                                    item.page
                                )

                        )

                        .map(
                            item => (

                                <NavLink

                                    key={
                                        item.path
                                    }

                                    to={
                                        item.path
                                    }

                                    className="sidebar-link"

                                >

                                    <span className="sidebar-icon">

                                        {
                                            item.icon
                                        }

                                    </span>


                                    {
                                        item.label
                                    }

                                </NavLink>

                            )
                        )
                }


                {/* ===================================================
                    TEAM MANAGEMENT

                    VendorAdmin:
                    Full access.

                    ADMIN:
                    Full access only while Support Mode is active.

                    VendorUser:
                    No access.
                =================================================== */}

                {
                    canManageTeam && (

                        <NavLink

                            to="/vendor/team"

                            className="sidebar-link"

                        >

                            <span className="sidebar-icon">

                                <FaUsers />

                            </span>


                            Team

                        </NavLink>

                    )
                }


            </nav>


        </aside>

    );

}