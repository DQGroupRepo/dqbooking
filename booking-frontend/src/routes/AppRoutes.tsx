import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import VendorLayout from "../layouts/VendorLayout";

import Home from "../pages/Home/Home";
import CategoryListing from "../pages/CategoryListing/CategoryListing";
import VendorDetail from "../pages/VendorDetail/VendorDetail";
import BookingCheckout from "../pages/BookingCheckout/BookingCheckout";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Review from "../pages/Review/Review";
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

const AppRoutes = () => {

    return (

        <BrowserRouter>

            <Routes>

                {/* Public Website */}

                <Route element={<MainLayout />}>

                    <Route path="/" element={<Home />} />

                    <Route
                        path="/categories"
                        element={<CategoryListing />}
                    />

                    <Route
                        path="/vendor/:serviceId"
                        element={<VendorDetail />}
                    />

                    <Route
                        path="/checkout"
                        element={<BookingCheckout />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/review"
                        element={<Review />}
                    />

                </Route>

                {/* Vendor Portal */}

                <Route element={<VendorLayout />}>

                    <Route
                        path="/vendor/dashboard"
                        element={<VendorDashboard />}
                    />

                    <Route
                        path="/vendor/create-listing"
                        element={<CreateListing />}
                    />

                    <Route
                        path="/vendor/add-service/:category"
                        element={<VendorAddService />}
                    />

                    <Route
                        path="/vendor/manage-services"
                        element={<ManageServices />}
                    />

                    <Route
                        path="/vendor/bookings"
                        element={<VendorBookingSummary />}
                    />

                    <Route
                        path="/vendor/bookings/:id"
                        element={<VendorBookingDetails />}
                    />



                    <Route

                        path="/vendor/revenue"

                        element={<VendorRevenue/>}

                    />

                    <Route

                        path="/vendor/reviews"

                        element={<VendorReviews/>}

                    />

                    <Route

                        path="/vendor/settings"

                        element={<VendorSettings/>}

                    />

                    <Route
                        path="/vendor/services/edit/:id"
                        element={<VendorAddService />}
                    />



                    <Route
                        path="/vendor/services/:id"
                        element={<VendorServiceWorkspace />}
                    >

                        <Route

                            index

                            element={<VendorServiceProfile />}

                        />

                        <Route

                            path="slots"

                            element={<ManageBookingSlots />}

                        />

                        <Route

                            path="availability"

                            element={<ManageAvailability />}

                        />

                        <Route
                            path="bookings"
                            element={<VendorServiceBookings />}
                        />

                        <Route
                            path="reviews"
                            element={<VendorServiceReviews />}
                        />

                        <Route
                            path="settings"
                            element={<ServiceSettings />}
                        />

                    </Route>


                </Route>

            </Routes>

        </BrowserRouter>

    );

};

export default AppRoutes;