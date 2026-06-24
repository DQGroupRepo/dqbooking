import { useParams } from "react-router-dom";

import VendorGallery from "../../components/vendor/VendorGallery";
import VendorInfo from "../../components/vendor/VendorInfo";
import VendorAmenities from "../../components/vendor/VendorAmenities";
import VendorPackages from "../../components/vendor/VendorPackages";
import VendorReviews from "../../components/vendor/VendorReviews";
import BookingCard from "../../components/vendor/BookingCard";

import { mockVendors } from "../../data/mockVendors";

import "./VendorDetail.css";


const VendorDetail = () => {

  const { id } = useParams();


  const vendor =
    mockVendors.find(
      item => item.id === Number(id)
    );


  if(!vendor){
    return <h2>Vendor not found</h2>;
  }


  return (

    <>

      <VendorGallery
        vendor={vendor}
      />


      <section className="section">

        <div className="container vendor-layout">


          <div className="vendor-main">


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
          />


        </div>

      </section>


    </>

  );

};


export default VendorDetail;