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

import AdminVendorVerificationService
  from "../services/AdminVendorVerificationService";

import VendorPermissionService from "../services/VendorPermissionService";

import type {
  VendorPermissionsResponse
} from "../services/VendorPermissionService";

import VendorSidebar
  from "../components/vendor/layout/Sidebar/VendorSidebar";

import VendorTopBar
  from "../components/vendor/layout/TopBar/VendorTopbar";

import "./VendorLayout.css";


const ALL_VENDOR_PAGES = [
  "DASHBOARD",
  "SERVICES",
  "BOOKINGS",
  "REVIEWS",
  "REVENUE",
  "BUNDLES",
  "PROFILE",
  "SETTINGS"
];


const VendorLayout = () => {

  const {
    user,
    isAuthenticated
  } = useAuth();


  const location = useLocation();


  const [
    supportChecking,
    setSupportChecking
  ] = useState(true);


  const [
    supportActive,
    setSupportActive
  ] = useState(false);


  const [
    permissionsChecking,
    setPermissionsChecking
  ] = useState(true);


  const [
    permissions,
    setPermissions
  ] = useState<VendorPermissionsResponse>({
    viewPages: [],
    editPages: []
  });


  /*
   * =========================================
   * CHECK ADMIN SUPPORT SESSION
   * =========================================
   */

  useEffect(() => {

    async function checkSupportSession() {

      /*
       * VendorAdmin / VendorUser
       *
       * These users do not need a support
       * session.
       */

      if (
        user?.role === "VENDOR_ADMIN" ||
        user?.role === "VENDOR_USER"
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

          setSupportActive(false);

        }
        finally {

          setSupportChecking(false);

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
   * LOAD VENDOR PERMISSIONS
   * =========================================
   */

  useEffect(() => {

    async function loadPermissions() {

      /*
       * =====================================
       * VENDOR ADMIN
       * =====================================
       *
       * VendorAdmin has complete access.
       */

      if (
        user?.role === "VENDOR_ADMIN"
      ) {

        setPermissions({
          viewPages: [...ALL_VENDOR_PAGES],
          editPages: [...ALL_VENDOR_PAGES]
        });

        setPermissionsChecking(false);

        return;

      }


      /*
       * =====================================
       * ADMIN SUPPORT MODE
       * =====================================
       *
       * Admin has complete vendor access
       * while Support Mode is active.
       */

      if (
        user?.role === "ADMIN" &&
        supportActive
      ) {

        setPermissions({
          viewPages: [...ALL_VENDOR_PAGES],
          editPages: [...ALL_VENDOR_PAGES]
        });

        setPermissionsChecking(false);

        return;

      }


      /*
       * =====================================
       * VENDOR USER
       * =====================================
       */

      if (
        user?.role === "VENDOR_USER"
      ) {

        try {

          const result =
            await VendorPermissionService
              .getCurrentPermissions();


          setPermissions({
            viewPages:
              result.viewPages ?? [],

            editPages:
              result.editPages ?? []
          });

        }
        catch (error) {

          console.error(
            "Failed to load vendor permissions:",
            error
          );

          setPermissions({
            viewPages: [],
            editPages: []
          });

        }
        finally {

          setPermissionsChecking(false);

        }

        return;

      }


      /*
       * =====================================
       * NO VENDOR PERMISSIONS
       * =====================================
       */

      setPermissions({
        viewPages: [],
        editPages: []
      });

      setPermissionsChecking(false);

    }


    loadPermissions();

  }, [
    user?.role,
    supportActive
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
   * CHECKING ADMIN SUPPORT SESSION
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
   * CHECKING VENDOR PERMISSIONS
   * =========================================
   */

  if (
    permissionsChecking
  ) {

    return (

      <div className="vendor-layout-loading">

        Loading vendor permissions...

      </div>

    );

  }


  /*
   * =========================================
   * NORMAL VENDOR WORKSPACE
   * =========================================
   */

  if (
    user?.role === "VENDOR_ADMIN" ||
    user?.role === "VENDOR_USER"
  ) {

    return (

      <div className="vendor-layout">

        <VendorSidebar
            viewPages={permissions.viewPages}
            supportActive={false}
        />

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

        <VendorSidebar
            viewPages={permissions.viewPages}
            supportActive={supportActive}
        />

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