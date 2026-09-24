import AmenitiesSection from "../AmenitiesSection/AmenitiesSection";

import CategoryDetailSections from "./CategoryDetailSections";

import type { VendorServiceForm } from "../../../../types/VendorServiceForm";

import CateringSection from "./CateringSection/CateringSection";
import type { CateringMenuItem } from "../../../types/CateringMenuItem";

interface Props {
    category: string;

    formData: VendorServiceForm;
    serviceId?: string;

    onDetailChange: (
        sectionKey: string,
        attributeKey: string,
        value: string | boolean
    ) => void;

    onCateringDetailsChange: (
        field: string,
        value: boolean | string[]
    ) => void;

    onCateringMenuItemsChange: (
        items: CateringMenuItem[]
    ) => void;

    amenities: string[];

    handleAmenityChange: (
        item: string
    ) => void;
}

/* =========================================
   CATEGORY AMENITIES

   Keep amenity configuration here for now.

   Category-specific detail fields are NOT
   stored here. Those come from
   ServiceDetailSectionUtil.
========================================= */

const CATEGORY_AMENITIES: Record<string, string[]> = {

    hall: [
        "Secure Digital Lockers",
        "Acoustics suitable for live music or wedding bands",
        "Lighting to accommodate professional photography",
        "Premium chairs",
        "Spacious Event Stage"
    ],

    catering: [],

    photography: [
        "Spacious Event Stage",
        "Curated Wardrobe & Props",
        "Dual-Slot Backup Systems",
        "Cloud & Offsite Storage",
        "Professional Equipment Redundancy",
        "Next-Day Sneak Peeks",
        "AI-Powered Face Recognition Galleries"
    ],

    decoration: [],

    makeup: []
};

const CategorySpecificSection = ({
    category,
    formData,
    serviceId,
    onDetailChange,
    amenities,
    handleAmenityChange,
    onCateringDetailsChange,
    onCateringMenuItemsChange
}: Props) => {

    const normalizedCategory =
        category?.toLowerCase().trim() ?? "";

    const amenityList =
        CATEGORY_AMENITIES[normalizedCategory] ?? [];

    return (
        <>

            {/* =====================================
               CATEGORY-SPECIFIC DETAILS
            ===================================== */}

            {normalizedCategory === "catering" ? (

                <CateringSection
                    formData={formData}
                    onCateringDetailsChange={
                        onCateringDetailsChange
                    }
                    onCateringMenuItemsChange={
                        onCateringMenuItemsChange
                    }
                    serviceId={serviceId}
                />

            ) : (

                <CategoryDetailSections
                    category={category}
                    formData={formData}
                    onDetailChange={onDetailChange}
                />

            )}


            {/* =====================================
               CATEGORY AMENITIES
            ===================================== */}

            {amenityList.length > 0 && (

                <AmenitiesSection
                    amenities={amenities}
                    amenityList={amenityList}
                    handleAmenityChange={
                        handleAmenityChange
                    }
                />

            )}

        </>
    );
};

export default CategorySpecificSection;