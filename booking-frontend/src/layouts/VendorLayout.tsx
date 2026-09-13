import {
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import {
  useAuth
} from "../context/AuthContext";

import AdminVendorVerificationService from "../services/AdminVendorVerificationService";

import VendorSidebar from "../components/vendor/layout/Sidebar/VendorSidebar";
import VendorTopBar from "../components/vendor/layout/TopBar/VendorTopbar";

import "./VendorLayout.css";


const VendorLayout = () => {

  const {
    user,
    isAuthenticated
  } = useAuth();


  const location = useLocation();


  const [
    supportChecking,
    setSupportChecking
  ] = useState(
    true
  );


  const [
    supportActive,
    setSupportActive
  ] = useState(
    false
  );


  /*
   * =========================================
   * CHECK ADMIN SUPPORT SESSION
   * =========================================
   *
   * Normal VENDOR users do not need a
   * support-session check.
   *
   * ADMIN users must have an active
   * VendorSupportSession before entering
   * the vendor workspace.
   */

  useEffect(() => {

    async function checkSupportSession() {

      /*
       * Normal vendor
       */

      if (
        user?.role === "VENDOR"
      ) {

        setSupportActive(false);

        setSupportChecking(false);

        return;

      }


      /*
       * ADMIN
       *
       * Check whether the admin currently
       * has an active vendor support session.
       */

      if (
        user?.role === "ADMIN"
      ) {

        try {

          const support =
            await AdminVendorVerificationService
              .getCurrentVendorSupport();


          setSupportActive(
            support !== null
          );

        }
        catch (error) {

          console.error(
            "Failed to check vendor support session:",
            error
          );


          setSupportActive(
            false
          );

        }
        finally {

          setSupportChecking(
            false
          );

        }

        return;

      }


      /*
       * Unknown / unsupported role
       */

      setSupportActive(false);

      setSupportChecking(false);

    }


    checkSupportSession();

  }, [
    user?.role
  ]);


  /*
   * =========================================
   * NOT AUTHENTICATED
   * =========================================
   */

  if (
    !isAuthenticated
  ) {

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
   * =========================================
   * CHECKING SUPPORT SESSION
   * =========================================
   */

  if (
    user?.role === "ADMIN" &&
    supportChecking
  ) {

    return (

      <div className="vendor-layout-loading">

        Loading vendor workspace...

      </div>

    );

  }


  /*
   * =========================================
   * NORMAL VENDOR
   * =========================================
   */

  if (
    user?.role === "VENDOR"
  ) {

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

  }


  /*
   * =========================================
   * ADMIN SUPPORT MODE
   * =========================================
   */

  if (
    user?.role === "ADMIN" &&
    supportActive
  ) {

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

  }


  /*
   * =========================================
   * ADMIN WITHOUT SUPPORT SESSION
   * =========================================
   */

  return (

    <Navigate
      to="/admin/vendors"
      replace
    />

  );

};


export default VendorLayout;