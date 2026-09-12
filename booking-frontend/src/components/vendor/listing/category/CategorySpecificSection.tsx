import AmenitiesSection
    from "../AmenitiesSection/AmenitiesSection";

import CategoryDetailSections
    from "./CategoryDetailSections";

import type {
    VendorServiceForm
} from "../../../../types/VendorServiceForm";


interface Props {

    category: string;

    formData: VendorServiceForm;

    onDetailChange: (
        sectionKey: string,
        attributeKey: string,
        value: string | boolean
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

const CATEGORY_AMENITIES:
    Record<
        string,
        string[]
    > = {

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


export default function CategorySpecificSection({

    category,

    formData,

    onDetailChange,

    amenities,

    handleAmenityChange

}: Props) {


    const normalizedCategory =
        category
            ?.toLowerCase()
            .trim() ?? "";


    const amenityList =
        CATEGORY_AMENITIES[
            normalizedCategory
        ] ?? [];


    return (

        <>

            {/* =====================================
               CATEGORY-SPECIFIC DETAILS
            ===================================== */}

            <CategoryDetailSections

                category={
                    category
                }

                formData={
                    formData
                }

                onDetailChange={
                    onDetailChange
                }

            />


            {/* =====================================
               CATEGORY AMENITIES
            ===================================== */}

            {
                amenityList.length > 0 && (

                    <AmenitiesSection

                        amenities={
                            amenities
                        }

                        amenityList={
                            amenityList
                        }

                        handleAmenityChange={
                            handleAmenityChange
                        }

                    />

                )
            }

        </>

    );

}