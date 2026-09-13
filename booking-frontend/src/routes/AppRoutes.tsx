import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
    useNavigationType
} from "react-router-dom";

import {
    Suspense,
    lazy,
    useEffect,
    useRef
} from "react";

import MainLayout from "../layouts/MainLayout";
import VendorLayout from "../layouts/VendorLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const Home = lazy(() => import("../pages/Home/Home"));
const CategoryListing = lazy(() => import("../pages/CategoryListing/CategoryListing"));
const VendorDetail = lazy(() => import("../pages/VendorDetail/VendorDetail"));
const BookingCheckout = lazy(() => import("../pages/BookingCheckout/BookingCheckout"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const Review = lazy(() => import("../pages/Customer/Review"));
const BookingConfirmation = lazy(() => import("../pages/BookingConfirmation/BookingConfirmation"));
const CustomerBookingGroupDetails = lazy(() => import("../pages/Customer/CustomerBookingGroupDetails"));
const CustomerBookings = lazy(() => import("../pages/Customer/CustomerBookings"));
const CustomerCancelBooking = lazy(() => import("../pages/Customer/CustomerCancelBooking"));
const BookingCancellationSuccess = lazy(() => import("../pages/Customer/BookingCancellationSuccess"));
const CustomerBookingDetails = lazy(() => import("../pages/Customer/CustomerBookingDetails"));
const VendorRegister = lazy(() => import("../pages/vendor/VendorRegister"));
const BundleSelection = lazy(() => import("../pages/BundleSelection/BundleSelection"));

const CreateListing = lazy(() => import("../pages/CreateListing/CreateListing"));
const VendorAddService = lazy(() => import("../pages/VendorAddService/VendorAddService"));
const VendorServiceWorkspace = lazy(() => import("../pages/vendor/VendorServiceWorkspace"));
const VendorServiceReviews = lazy(() => import("../pages/vendor/VendorServiceReviews"));
const VendorDashboard = lazy(() => import("../pages/VendorDashboard/VendorDashboard"));
const ManageServices = lazy(() => import("../pages/ManageServices/ManageServices"));
const VendorBookingSummary = lazy(() => import("../pages/VendorBookingSummary/VendorBookingSummary"));
const VendorBookingDetails = lazy(() => import("../pages/VendorBookingDetails/VendorBookingDetails"));
const VendorServiceProfile = lazy(() => import("../pages/VendorServiceProfile/VendorServiceProfile"));
const VendorRevenue = lazy(() => import("../pages/VendorRevenue/VendorRevenue"));
const VendorReviews = lazy(() => import("../pages/VendorReviews/VendorReviews"));
const VendorSettings = lazy(() => import("../pages/VendorSettings/VendorSettings"));
const ManageBookingSlots = lazy(() => import("../pages/vendor/ManageBookingSlots"));
const ManageAvailability = lazy(() => import("../pages/vendor/ManageAvailability"));
const VendorServiceBookings = lazy(() => import("../pages/vendor/VendorServiceBookings"));
const ServiceSettings = lazy(() => import("../pages/vendor/ServiceSettings"));
const VendorPricing = lazy(() => import("../pages/vendor/pricing/VendorPricing"));
const VendorBundleManagement = lazy(() => import("../pages/vendor/VendorBundleManagement"));
const VendorCreateBundle = lazy(() => import("../pages/vendor/VendorCreateBundle"));

const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const AdminUsers = lazy(() => import("../pages/Admin/AdminUsers"));
const AdminBookings = lazy(() => import("../pages/Admin/AdminBookings"));
const AdminReviews = lazy(() => import("../pages/Admin/AdminReviews"));
const AdminVendorVerificationPage = lazy(() => import("../pages/Admin/AdminVendorVerification"));


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


    /*
     * Used to identify the first render
     * after the application starts.
     *
     * Initial page load should always
     * start from the top.
     */

    const isInitialRender =
        useRef(true);


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
            location.pathname ===
            "/categories" &&
            navigationType ===
            "POP"
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

                    requestAnimationFrame(
                        () => {

                            window.scrollTo({
                                top:
                                    scrollPosition.top ??
                                    0,

                                left:
                                    scrollPosition.left ??
                                    0,

                                behavior:
                                    "auto"
                            });

                        }
                    );


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

    const routeFallback = (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            Loading...
        </div>
    );

    return (

        <BrowserRouter>


            {/* =====================================
                GLOBAL SCROLL MANAGEMENT
            ===================================== */}

            <ScrollManager />

            <Suspense fallback={routeFallback}>

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
                                    ["VENDOR"]
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
                                    <AdminVendorVerificationPage />
                                }
                            />


                        </Route>


                    </Route>


                </Routes>

            </Suspense>

        </BrowserRouter>

    );

};


export default AppRoutes;