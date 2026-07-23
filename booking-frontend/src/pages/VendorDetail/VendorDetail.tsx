import { useParams } from "react-router-dom";

import VendorGallery from "../../components/vendor/VendorGallery";
import VendorInfo from "../../components/vendor/VendorInfo";
import VendorAmenities from "../../components/vendor/VendorAmenities";
import VendorPackages from "../../components/vendor/VendorPackages";
import VendorReviews from "../../components/vendor/VendorReviews";
import BookingCard from "../../components/vendor/BookingCard";
import { useEffect, useState } from "react";

import VendorDetailService from "../../services/VendorDetailService";

import type { VendorDetail } from "../../types/VendorDetail";
import "./VendorDetail.css";


const VendorDetail = () => {

const { serviceId } = useParams();

const [vendor, setVendor] = useState<VendorDetail>();

useEffect(() => {

    if (serviceId) {
        loadVendor(serviceId);
    }

}, [serviceId]);

async function loadVendor(serviceId: string) {

    if (!serviceId) return;

    const data =
        await VendorDetailService.getById(serviceId);

    setVendor(data);

}

if (!vendor) {

    return <h2>Loading...</h2>;

}


  return (

    <>

      <VendorGallery
        vendor={vendor}
      />


      <section className="section">

        <div className="container vendor-layout">

          <div className="vendor-detail-main">

            <VendorInfo vendor={vendor} />

            <VendorAmenities vendor={vendor} />

            <VendorPackages />

            <VendorReviews />

          </div>

          <BookingCard vendor={vendor} />

        </div>

      </section>


    </>

  );

};


export default VendorDetail;