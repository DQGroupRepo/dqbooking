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
  viewPages
}: VendorSidebarProps) {


  const {
    user
  } = useAuth();


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

            .filter(item =>

              item.page === null ||
              viewPages.includes(item.page)

            )

            .map(item => (

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


        {/* ===================================================
            VENDOR ADMIN ONLY
        =================================================== */}

        {
          user?.role === "VENDOR_ADMIN" && (

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