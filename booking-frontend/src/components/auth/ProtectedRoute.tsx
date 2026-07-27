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
} from "../context/AuthContext";


interface ProtectedRouteProps {

    allowedRoles?: UserRole[];

}


const ProtectedRoute = ({
    allowedRoles
}: ProtectedRouteProps) => {

    const {
        user,
        isAuthenticated
    } = useAuth();

    const location = useLocation();


    /*
     * User is not logged in
     */

    if (!isAuthenticated || !user) {

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
     * User is logged in,
     * but does not have permission
     */

    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {

        if (user.role === "VENDOR") {

            return (
                <Navigate
                    to="/vendor/dashboard"
                    replace
                />
            );

        }


        if (user.role === "ADMIN") {

            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );

        }


        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    return <Outlet />;

};


export default ProtectedRoute;