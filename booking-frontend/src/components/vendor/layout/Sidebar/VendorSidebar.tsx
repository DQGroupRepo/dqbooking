import { NavLink } from "react-router-dom";

import {
  FaChartPie,
  FaPlusCircle,
  FaConciergeBell,
  FaCalendarAlt,
  FaStar,
  FaWallet,
  FaCog,
  FaChartLine
} from "react-icons/fa";

import "./VendorSidebar.css";

const vendorMenu = [
  {
    label: "Dashboard",
    path: "/vendor/dashboard",
    icon: <FaChartPie />
  },
  {
    label: "Create Listing",
    path: "/vendor/create-listing",
    icon: <FaPlusCircle />
  },
  {
    label: "Services",
    path: "/vendor/manage-services",
    icon: <FaConciergeBell />
  },
  {
    label: "Bookings",
    path: "/vendor/bookings",
    icon: <FaCalendarAlt />
  },
  {
    label: "Reviews",
    path: "/vendor/reviews",
    icon: <FaStar />
  },
  {
    label: "Revenue",
    path: "/vendor/revenue",
    icon: <FaChartLine />
  },
  {
    label: "Settings",
    path: "/vendor/settings",
    icon: <FaCog />
  }
];

export default function VendorSidebar() {

    return (

        <aside className="vendor-sidebar">

            <div className="vendor-logo">

                <span className="logo-icon">🎉</span>

                <div>

                    <h2>EventNest</h2>

                    <p>Vendor Portal</p>

                </div>

            </div>

            <nav>

                {

                    vendorMenu.map(item=>(

                        <NavLink

                            key={item.path}

                            to={item.path}

                            className="sidebar-link"

                        >

                            <span className="sidebar-icon">

                                {item.icon}

                            </span>

                            {item.label}

                        </NavLink>

                    ))

                }

            </nav>

        </aside>

    );

}