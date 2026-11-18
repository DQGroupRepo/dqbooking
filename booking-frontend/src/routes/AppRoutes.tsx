import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
    useNavigationType
} from "react-router-dom";

import {
    useEffect,
    useRef
} from "react";

import MainLayout from "../layouts/MainLayout";
import VendorLayout from "../layouts/VendorLayout";

import Home from "../pages/Home/Home";
import StaticInfoPage from "../pages/StaticInfo/StaticInfoPage";
import CategoryListing from "../pages/CategoryListing/CategoryListing";
import VendorDetail from "../pages/VendorDetail/VendorDetail";
import BookingCheckout from "../pages/BookingCheckout/BookingCheckout";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import CreateListing from "../pages/CreateListing/CreateListing";
import VendorAddService from "../pages/VendorAddService/VendorAddService";
import VendorServiceWorkspace from "../pages/vendor/VendorServiceWorkspace";
import VendorServiceReviews from "../pages/vendor/VendorServiceReviews";
import VendorDashboard from "../pages/VendorDashboard/VendorDashboard";
import ManageServices from "../pages/ManageServices/ManageServices";
import VendorBookingSummary from "../pages/VendorBookingSummary/VendorBookingSummary";
import VendorBookingDetails from "../pages/VendorBookingDetails/VendorBookingDetails";
import VendorServiceProfile from "../pages/VendorServiceProfile/VendorServiceProfile";
import VendorRevenue from "../pages/VendorRevenue/VendorRevenue";
import VendorReviews from "../pages/VendorReviews/VendorReviews";
import VendorSettings from "../pages/VendorSettings/VendorSettings";
import ManageBookingSlots from "../pages/vendor/ManageBookingSlots";
import ManageAvailability from "../pages/vendor/ManageAvailability";
import VendorServiceBookings from "../pages/vendor/VendorServiceBookings";
import ServiceSettings from "../pages/vendor/ServiceSettings";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import VendorRegister from "../pages/vendor/VendorRegister";
import VendorPricing from "../pages/vendor/pricing/VendorPricing";
import BookingConfirmation from "../pages/BookingConfirmation/BookingConfirmation";
import CustomerBookings from "../pages/Customer/CustomerBookings";
import CustomerCancelBooking from "../pages/Customer/CustomerCancelBooking";
import BookingCancellationSuccess from "../pages/Customer/BookingCancellationSuccess";
import CustomerBookingDetails from "../pages/Customer/CustomerBookingDetails";
import Review from "../pages/Customer/Review";
import CustomerBookingGroupDetails from "../pages/Customer/CustomerBookingGroupDetails";

import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminUsers from "../pages/Admin/AdminUsers";
import AdminBookings from "../pages/Admin/AdminBookings";
import AdminReviews from "../pages/Admin/AdminReviews";
import AdminVendorVerification from "../pages/Admin/AdminVendorVerification";
import VendorTeam from "../pages/vendor/VendorTeam";

import Cart from "../pages/Cart/Cart";

import VendorBundles from "../pages/VendorBundles/VendorBundles";

import VendorBundleManagement from "../pages/vendor/VendorBundleManagement";
import VendorCreateBundle from "../pages/vendor/VendorCreateBundle";

import BundleSelection from "../pages/BundleSelection/BundleSelection";


/*
 * =========================================
 * SCROLL STORAGE KEY
 * =========================================
 */

const CATEGORY_SCROLL_KEY =
    "eventnest-category-listing-scroll";


/*
 * =========================================
 * SCROLL MANAGER
 * =========================================
 *
 * Normal pages:
 *
 * New navigation
 *      -> top
 *
 * Refresh
 *      -> top
 *
 * Category Listing:
 *
 * Browser back navigation
 *      -> restore saved position
 */

const ScrollManager = () => {

    const location =
        useLocation();


    const navigationType =
        useNavigationType();

    // Preserve the last in-app route before visiting public auth pages.
    useEffect(() => {
        if (
            location.pathname === "/login" ||
            location.pathname === "/register"
        ) {
            return;
        }

        try {
            sessionStorage.setItem(
                "eventnest:last-page-before-login",
                `${location.pathname}${location.search}${location.hash}`
            );
        } catch {
            // Navigation should continue normally if storage is unavailable.
        }
    }, [location.pathname, location.search, location.hash]);


    /*
     * Used to identify the first render
     * after the application starts.
     *
     * Initial page load should always
     * start from the top.
     */

    const isInitialRender =
        useRef(true);

    /*
     * Capture the listing's current scroll position while it is visible.
     * This runs independently of route changes so navigating to a detail
     * page cannot lose the last listing position.
     */
    useEffect(() => {
        if (location.pathname !== "/categories") {
            return;
        }

        const saveScrollPosition = () => {
            sessionStorage.setItem(
                CATEGORY_SCROLL_KEY,
                JSON.stringify({
                    top: window.scrollY,
                    left: window.scrollX
                })
            );
        };

        saveScrollPosition();
        window.addEventListener("scroll", saveScrollPosition, { passive: true });
        window.addEventListener("pagehide", saveScrollPosition);

        return () => {
            saveScrollPosition();
            window.removeEventListener("scroll", saveScrollPosition);
            window.removeEventListener("pagehide", saveScrollPosition);
        };
    }, [location.pathname]);


    useEffect(() => {

        /*
         * =====================================
         * INITIAL PAGE LOAD / REFRESH
         * =====================================
         */

        if (
            isInitialRender.current
        ) {

            isInitialRender.current =
                false;


            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto"
            });


            return;

        }


        /*
         * =====================================
         * CATEGORY LISTING BACK RESTORATION
         * =====================================
         */

        if (
            location.pathname === "/categories" &&
            (
                navigationType === "POP" ||
                location.state?.restoreScroll === true
            )
        ) {

            const savedScroll =
                sessionStorage.getItem(
                    CATEGORY_SCROLL_KEY
                );


            if (
                savedScroll
            ) {

                try {

                    const scrollPosition =
                        JSON.parse(
                            savedScroll
                        );


                    /*
                     * Wait until CategoryListing
                     * has rendered.
                     */

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            window.scrollTo({
                                top: scrollPosition.top ?? 0,
                                left: scrollPosition.left ?? 0,
                                behavior: "auto"
                            });
                        });
                    });


                    return;

                }
                catch {

                    /*
                     * Invalid saved value.
                     *
                     * Fall back to top.
                     */

                    sessionStorage.removeItem(
                        CATEGORY_SCROLL_KEY
                    );

                }

            }

        }


        /*
         * =====================================
         * ALL OTHER NAVIGATION
         * =====================================
         */

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });


    }, [

        location.pathname,
        location.search,
        location.state,
        navigationType

    ]);


    return null;

};


/*
 * =========================================
 * APP ROUTES
 * =========================================
 */

const AppRoutes = () => {

    return (

        <BrowserRouter>


            {/* =====================================
                GLOBAL SCROLL MANAGEMENT
            ===================================== */}

            <ScrollManager />


            <Routes>


                {/* =====================================
                    PUBLIC WEBSITE
                ===================================== */}

                <Route
                    element={
                        <MainLayout />
                    }
                >

                    <Route
                        path="/"
                        element={
                            <Home />
                        }
                    />


                    <Route
                        path="/categories"
                        element={
                            <CategoryListing />
                        }
                    />

                    <Route path="/help-center" element={<StaticInfoPage page="help" />} />
                    <Route path="/contact-us" element={<StaticInfoPage page="contact" />} />
                    <Route path="/terms-and-conditions" element={<StaticInfoPage page="terms" />} />
                    <Route path="/privacy-policy" element={<StaticInfoPage page="privacy" />} />


                    <Route
                        path="/vendor/:serviceId"
                        element={
                            <VendorDetail />
                        }
                    />


                    <Route
                        path="/checkout"
                        element={
                            <BookingCheckout />
                        }
                    />


                    <Route
                        path="/bundles/available/:serviceId"
                        element={
                            <BundleSelection />
                        }
                    />


                    <Route
                        path="/login"
                        element={
                            <Login />
                        }
                    />


                    <Route
                        path="/register"
                        element={
                            <Register />
                        }
                    />


                    <Route
                        path="/cart"
                        element={
                            <Cart />
                        }
                    />


                    <Route
                        path="/customer/bookings/:bookingId/review"
                        element={
                            <Review />
                        }
                    />


                    <Route
                        path="/vendor/register"
                        element={
                            <VendorRegister />
                        }
                    />


                    <Route
                        path="/booking-confirmation/:bookingGroupId"
                        element={
                            <BookingConfirmation />
                        }
                    />

                    <Route
                        path="/customer/bookings/group/:bookingGroupId"
                        element={
                            <CustomerBookingGroupDetails />
                        }
                    />


                    <Route
                        path="/customer/bookings"
                        element={
                            <CustomerBookings />
                        }
                    />


                    <Route
                        path="/customer/bookings/group/:bookingGroupId/cancel"
                        element={
                            <CustomerCancelBooking />
                        }
                    />


                    <Route
                        path="/customer/bookings/cancelled"
                        element={
                            <BookingCancellationSuccess />
                        }
                    />


                    <Route
                        path="/customer/bookings/:bookingId"
                        element={
                            <CustomerBookingDetails />
                        }
                    />


                </Route>


                {/* =====================================
                    VENDOR PORTAL
                ===================================== */}

                <Route

                    element={
                        <ProtectedRoute
                            allowedRoles={
                                [
                                    "VENDOR_ADMIN",
                                    "VENDOR_USER",
                                    "ADMIN"
                                ]
                            }
                        />
                    }

                >

                    <Route
                        element={
                            <VendorLayout />
                        }
                    >


                        <Route
                            path="/vendor/dashboard"
                            element={
                                <VendorDashboard />
                            }
                        />


                        <Route
                            path="/vendor/create-listing"
                            element={
                                <CreateListing />
                            }
                        />


                        <Route
                            path="/vendor/add-service/:category"
                            element={
                                <VendorAddService />
                            }
                        />


                        <Route
                            path="/vendor/manage-services"
                            element={
                                <ManageServices />
                            }
                        />

                        <Route
                            path="/vendor/bundles"
                            element={
                                <VendorBundleManagement />
                            }
                        />


                        <Route
                            path="/vendor/bundles/create"
                            element={
                                <VendorCreateBundle />
                            }
                        />

                        <Route
                            path="/vendor/bundles/edit/:bundleId"
                            element={
                                <VendorCreateBundle />
                            }
                        />

                        <Route
                            path="/vendor/team"
                            element={
                                <VendorTeam />
                            }
                        />


                        <Route
                            path="/vendor/bookings"
                            element={
                                <VendorBookingSummary />
                            }
                        />


                        <Route
                            path="/vendor/bookings/:id"
                            element={
                                <VendorBookingDetails />
                            }
                        />


                        <Route
                            path="/vendor/revenue"
                            element={
                                <VendorRevenue />
                            }
                        />


                        <Route
                            path="/vendor/reviews"
                            element={
                                <VendorReviews />
                            }
                        />


                        <Route
                            path="/vendor/settings"
                            element={
                                <VendorSettings />
                            }
                        />


                        <Route
                            path="/vendor/services/edit/:id"
                            element={
                                <VendorAddService />
                            }
                        />


                        <Route
                            path="/vendor/services/:serviceId"
                            element={
                                <VendorServiceWorkspace />
                            }
                        >


                            <Route
                                path="pricing"
                                element={
                                    <VendorPricing />
                                }
                            />


                            <Route

                                index

                                element={
                                    <VendorServiceProfile />
                                }

                            />


                            <Route
                                path="slots"
                                element={
                                    <ManageBookingSlots />
                                }
                            />


                            <Route
                                path="availability"
                                element={
                                    <ManageAvailability />
                                }
                            />


                            <Route
                                path="bookings"
                                element={
                                    <VendorServiceBookings />
                                }
                            />


                            <Route
                                path="reviews"
                                element={
                                    <VendorServiceReviews />
                                }
                            />


                            <Route
                                path="settings"
                                element={
                                    <ServiceSettings />
                                }
                            />


                        </Route>


                    </Route>


                </Route>


                {/* =====================================
                    ADMIN PORTAL
                ===================================== */}

                <Route

                    element={
                        <ProtectedRoute
                            allowedRoles={
                                ["ADMIN"]
                            }
                        />
                    }

                >

                    <Route
                        element={
                            <AdminLayout />
                        }
                    >


                        <Route
                            path="/admin/dashboard"
                            element={
                                <AdminDashboard />
                            }
                        />


                        <Route
                            path="/admin/users"
                            element={
                                <AdminUsers />
                            }
                        />


                        <Route
                            path="/admin/bookings"
                            element={
                                <AdminBookings />
                            }
                        />


                        <Route
                            path="/admin/reviews"
                            element={
                                <AdminReviews />
                            }
                        />


                        <Route
                            path="/admin/vendors"
                            element={
                                <AdminVendorVerification />
                            }
                        />


                    </Route>


                </Route>


            </Routes>


        </BrowserRouter>

    );

};


export default AppRoutes;
