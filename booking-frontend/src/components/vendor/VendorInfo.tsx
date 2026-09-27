import type { VendorDetail } from "../../types/VendorDetail";
import "./VendorInfo.css";


interface Props {
  vendor: VendorDetail
}


const VendorInfo = ({ vendor }: Props) => {

  return (

    <div className="vendor-info">


      <div className="service-title">

        <h1>
          {vendor.serviceName}
        </h1>

        <div className="business-name">
          by
          <span>
            {vendor.businessName}
          </span>
        </div>

      </div>

      <div className="rating-large">

        <span>
          ⭐⭐⭐⭐⭐
        </span>

        <span className="rating-text">
          {vendor.rating}
          {vendor.reviewCount &&
            ` (${vendor.reviewCount} Reviews)`
          }
        </span>

      </div>



      <p className="location">

        📍 {vendor.city}

      </p>




      <p className="description">

        {vendor.description}

      </p>


    </div>

  );

};


export default VendorInfo;