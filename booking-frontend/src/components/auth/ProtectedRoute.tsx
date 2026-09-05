import {
    Navigate,
    Outlet,
    useLocation
} from "react-router-dom";

import {
    useAuth
} from "../../context/AuthContext";

import type {
    UserRole
} from "../../context/AuthContext";


interface ProtectedRouteProps {

    allowedRoles?: UserRole[];

}


const ProtectedRoute = ({
    allowedRoles
}: ProtectedRouteProps) => {

    const {
        user,
        isAuthenticated,
        authLoading
    } = useAuth();

    const location =
        useLocation();


    /*
     * =========================================
     * AUTHENTICATION INITIALIZATION
     * =========================================
     *
     * Wait until AuthContext has finished
     * validating the stored JWT with the backend.
     *
     * This prevents a refresh from temporarily
     * redirecting an authenticated user to login.
     */

    if (authLoading) {

        return (

            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    color: "#6b7c88"
                }}
            >

                Checking authentication...

            </div>

        );

    }


    /*
     * =========================================
     * USER NOT AUTHENTICATED
     * =========================================
     */

    if (
        !isAuthenticated ||
        !user
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
     * ROLE AUTHORIZATION
     * =========================================
     *
     * User is authenticated, but may not have
     * permission to access this route.
     */

    if (
        allowedRoles &&
        !allowedRoles.includes(
            user.role
        )
    ) {


        /*
         * Vendor
         */

        if (
            user.role === "VENDOR"
        ) {

            return (

                <Navigate
                    to="/vendor/dashboard"
                    replace
                />

            );

        }


        /*
         * Admin
         */

        if (
            user.role === "ADMIN"
        ) {

            return (

                <Navigate
                    to="/admin/dashboard"
                    replace
                />

            );

        }


        /*
         * Customer / fallback
         */

        return (

            <Navigate
                to="/"
                replace
            />

        );

    }


    /*
     * =========================================
     * AUTHENTICATED + AUTHORIZED
     * =========================================
     */

    return <Outlet />;

};


export default ProtectedRoute;