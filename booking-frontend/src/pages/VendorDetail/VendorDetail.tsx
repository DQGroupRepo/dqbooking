import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import VendorGallery from "../../components/vendor/VendorGallery";
import VendorInfo from "../../components/vendor/VendorInfo";
import VendorAmenities from "../../components/vendor/VendorAmenities";
import VendorPackages from "../../components/vendor/VendorPackages";
import VendorReviews from "../../components/vendor/VendorReviews";
import BookingCard from "../../components/vendor/BookingCard";

import VendorDetailService from "../../services/VendorDetailService";

import type { VendorDetail as VendorDetailType } from "../../types/VendorDetail";

import "./VendorDetail.css";

const VendorDetail = () => {

const { serviceId } = useParams();

const [vendor, setVendor] =
    useState<VendorDetailType>();

useEffect(() => {

    if (serviceId) {
        loadVendor(serviceId);
    }

}, [serviceId]);

const loadVendor = async (id: string) => {

    try {

        const data =
            await VendorDetailService.getById(id);

        setVendor(data);

    } catch (error) {

        console.error(
            "Failed to load vendor details:",
            error
        );

    }

};

if (!vendor) {

    return (
        <h2>Loading...</h2>
    );

}

return (

    <>

        <VendorGallery
            vendor={vendor}
        />

        <section className="section">

            <div className="container vendor-layout">

                <div className="vendor-detail-main">

                    <VendorInfo
                        vendor={vendor}
                    />

                    <VendorAmenities
                        vendor={vendor}
                    />

                    <VendorPackages />

                    <VendorReviews />

                </div>

                <BookingCard
                    vendor={vendor}
                    serviceId={serviceId}
                />

            </div>

        </section>

    </>

);


};

export default VendorDetail;