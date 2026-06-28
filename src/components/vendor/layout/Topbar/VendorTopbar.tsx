import {
  FaBell,
  FaSearch,
  FaChevronDown
} from "react-icons/fa";

import "./VendorTopbar.css";

export default function VendorTopbar() {

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (

    <header className="vendor-topbar">

      <div className="topbar-left">

        <h2>Dashboard</h2>

        <span>{today}</span>

      </div>

      <div className="topbar-center">

        <div className="search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search bookings, customers..."
          />

        </div>

      </div>

      <div className="topbar-right">

        <button className="notification-btn">

          <FaBell />

          <span className="badge">3</span>

        </button>

        <div className="profile-box">

          <div className="avatar">
            RP
          </div>

          <div>

            <h4>Royal Palace</h4>

            <span>Vendor</span>

          </div>

          <FaChevronDown />

        </div>

      </div>

    </header>

  );

}