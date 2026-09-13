import {
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";

import {
  useAuth
} from "../context/AuthContext";

import VendorSidebar from "../components/vendor/layout/Sidebar/VendorSidebar";
import VendorTopBar from "../components/vendor/layout/Topbar/VendorTopbar";

import "./VendorLayout.css";


const VendorLayout = () => {

  const {
    user,
    isAuthenticated
  } = useAuth();


  const location = useLocation();


  /*
   * Not logged in
   */

  if (!isAuthenticated) {

    return (

      <Navigate
        to="/login"
        state={{
          from: location
        }}
        replace
      />

    );

  }


  /*
   * Logged in but not a Vendor
   */

  if (user?.role !== "VENDOR") {

    return (

      <Navigate
        to="/"
        replace
      />

    );

  }


  return (

    <div className="vendor-layout">

      <VendorSidebar />

      <div className="vendor-main">

        <VendorTopBar />

        <main className="vendor-content">

          <Outlet />

        </main>

      </div>

    </div>

  );

};


export default VendorLayout;