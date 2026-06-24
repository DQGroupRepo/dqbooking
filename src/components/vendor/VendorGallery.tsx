import type { Vendor } from "../../types/Vendor";
import "./VendorGallery.css";

interface Props {
  vendor: Vendor;
}


const VendorGallery = ({ vendor }: Props) => {

  const images =
    vendor.gallery && vendor.gallery.length > 0
      ? vendor.gallery
      : [vendor.imageUrl];


  return (

    <section className="vendor-gallery container">


      <div className="main-image">

        <img
          src={images[0]}
          alt={vendor.businessName}
        />

      </div>



      <div className="thumbnail-row">


        {images.slice(0,4).map((image,index)=>(

          <img
            key={index}
            src={image}
            alt={`${vendor.businessName}-${index}`}
          />

        ))}



        <div className="more-images">

          +12 Photos

        </div>


      </div>


    </section>

  );

};


export default VendorGallery;