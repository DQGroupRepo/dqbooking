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

import VendorDashboard from "../pages/VendorDashboard/VendorDashboard";
import ManageServices from "../pages/ManageServices/ManageServices";

const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public Website */}

        <Route element={<MainLayout />}>

          <Route path="/" element={<Home />} />

          <Route path="/categories" element={<CategoryListing />} />

          <Route path="/vendor/:id" element={<VendorDetail />} />

          <Route path="/checkout" element={<BookingCheckout />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/review" element={<Review />} />

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

        </Route>

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;