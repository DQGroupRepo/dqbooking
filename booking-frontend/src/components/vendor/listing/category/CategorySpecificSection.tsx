import CategoryDetailSections from "./CategoryDetailSections";
import type { VendorServiceForm } from "../../../../types/VendorServiceForm";
import CateringSection from "./CateringSection/CateringSection";
import type { CateringMenuItem } from "../../../../types/CateringMenuItem";
import ServiceAttributeSelector from "../ServiceAttributeSelector/ServiceAttributeSelector";

interface Props {
  category: string;
  formData: VendorServiceForm;
  serviceId?: string;
  onDetailChange: (sectionKey: string, attributeKey: string, value: string | boolean) => void;
  onCateringDetailsChange: (field: string, value: boolean | string[]) => void;
  onCateringMenuItemsChange: (items: CateringMenuItem[]) => void;
  facilities: string[];
  onFacilitiesChange: (values: string[]) => void;
  amenities: string[];
  onAmenitiesChange: (values: string[]) => void;
}

const CategorySpecificSection = ({
  category,
  formData,
  serviceId,
  onDetailChange,
  facilities,
  onFacilitiesChange,
  amenities,
  onAmenitiesChange,
  onCateringDetailsChange,
  onCateringMenuItemsChange
}: Props) => {
  const normalizedCategory = category?.toUpperCase().trim() ?? "";

  return (
    <>
      {normalizedCategory === "CATERING" ? (
        <CateringSection
          formData={formData}
          onCateringDetailsChange={onCateringDetailsChange}
          onCateringMenuItemsChange={onCateringMenuItemsChange}
          serviceId={serviceId}
        />
      ) : (
        <CategoryDetailSections
          category={category}
          formData={formData}
          onDetailChange={onDetailChange}
        />
      )}

      <ServiceAttributeSelector
        category={normalizedCategory}
        type="FACILITY"
        title="Facilities"
        subtitle="Select the facilities and services available at your business."
        selected={facilities}
        onChange={onFacilitiesChange}
      />

      <ServiceAttributeSelector
        category={normalizedCategory}
        type="AMENITY"
        title="Amenities"
        subtitle="Select the conveniences and included features customers can expect."
        selected={amenities}
        onChange={onAmenitiesChange}
      />
    </>
  );
};

export default CategorySpecificSection;
