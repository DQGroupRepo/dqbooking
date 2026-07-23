import type { VendorDetail } from "../../types/VendorDetail";
import "./VendorAmenities.css";


interface Props {
  vendor: VendorDetail
}


const VendorAmenities = ({ vendor }: Props) => {


  if (!vendor.amenities || vendor.amenities.length === 0) {
    return null;
  }


  return (

    <section className="vendor-amenities">


      <h2>
        Amenities
      </h2>



      <div className="amenities-grid">


        {vendor.amenities.map((amenity, index) => (

          <div
            className="amenity-card"
            key={index}
          >

            <span className="amenity-icon">
              ✓
            </span>


            <span>
              {amenity}
            </span>


          </div>

        ))}


      </div>


    </section>

  );

};


export default VendorAmenities;