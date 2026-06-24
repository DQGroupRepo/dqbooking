import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home";
import CategoryListing from "../pages/CategoryListing/CategoryListing";
import VendorDetail from "../pages/VendorDetail/VendorDetail";
import BookingCheckout from "../pages/BookingCheckout/BookingCheckout";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Review from "../pages/Review/Review";
import AddService from "../pages/AddService/AddService";
import VendorDashboard from "../pages/VendorDashboard/VendorDashboard";
import ManageServices from "../pages/ManageServices/ManageServices";

const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route element={<MainLayout />}>


         <Route
          path="/"
          element={<Home />}
         />


         <Route
          path="/categories"
          element={<CategoryListing />}
         />


         <Route
          path="/vendor/:id"
          element={<VendorDetail />}
         />


         <Route
          path="/checkout"
          element={<BookingCheckout />}
         />

         <Route path="/login" element={<Login />}/>

         <Route path="/register" element={<Register />} />

         <Route
          path="/review"
          element={<Review />}
         />

         <Route path="/add-service" element={<AddService />}/>
         <Route path="/dashboard" element={<VendorDashboard />}/>
         <Route path="/manage-services" element={<ManageServices />}/>


         </Route>





      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;