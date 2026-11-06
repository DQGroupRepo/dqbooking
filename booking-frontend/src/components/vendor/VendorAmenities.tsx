import type { VendorDetail } from "../../types/VendorDetail";
import "./VendorAmenities.css";

interface Props {
  vendor: VendorDetail;
}

const VendorAmenities = ({ vendor }: Props) => {
  const facilities = vendor.facilities ?? [];
  const amenities = vendor.amenities ?? [];

  if (facilities.length === 0 && amenities.length === 0) return null;

  const renderItems = (items: string[]) => (
    <div className="amenities-grid">
      {items.map((item, index) => (
        <div className="amenity-card" key={`${item}-${index}`}>
          <span className="amenity-icon">✓</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section className="vendor-amenities">
      {facilities.length > 0 && (
        <div className="vendor-attribute-group">
          <h2>Facilities</h2>
          {renderItems(facilities)}
        </div>
      )}
      {amenities.length > 0 && (
        <div className="vendor-attribute-group">
          <h2>Amenities</h2>
          {renderItems(amenities)}
        </div>
      )}
    </section>
  );
};

export default VendorAmenities;
