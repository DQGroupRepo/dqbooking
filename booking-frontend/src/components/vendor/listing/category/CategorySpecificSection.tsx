import HallSection
    from "./HallSection/HallSection";

import CateringSection
    from "./CateringSection/CateringSection";

import PhotographySection
    from "./PhotographySection/PhotographySection";

import DecorationSection
    from "./DecorationSection/DecorationSection";

import MakeupSection
    from "./MakeupSection/MakeupSection";

import AmenitiesSection
    from "../AmenitiesSection/AmenitiesSection";

import type {
    VendorServiceForm
} from "../../../../types/VendorServiceForm";


interface Props {

    category: string;

    formData: VendorServiceForm;

    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => void;

    amenities: string[];

    handleAmenityChange: (
        item: string
    ) => void;

}


/*
 * =========================================================
 * CATEGORY SPECIFIC AMENITIES
 * =========================================================
 *
 * The existing Hall amenities have been moved here.
 *
 * We are intentionally NOT inventing amenity values for
 * the other categories yet.
 *
 * Add their real business-approved options here when ready.
 */

const CATEGORY_AMENITIES:
    Record<string, string[]> = {

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

    handleChange,

    amenities,

    handleAmenityChange

}: Props) {


    const normalizedCategory =
        category
            ?.toLowerCase()
            .trim() || "";


    const amenityList =
        CATEGORY_AMENITIES[
        normalizedCategory
        ] ?? [];


    /*
     * =========================================================
     * CATEGORY CONTENT
     * =========================================================
     */

    let categoryContent:
        React.ReactNode = null;


    switch (
    normalizedCategory
    ) {

        case "hall":

            categoryContent = (

                <HallSection

                    formData={
                        formData
                    }

                    handleChange={
                        handleChange
                    }

                />

            );

            break;


        case "catering":

            categoryContent = (

                <CateringSection

                    formData={
                        formData
                    }

                    handleChange={
                        handleChange
                    }

                />

            );

            break;


        case "photography":

            categoryContent = (

                <PhotographySection

                    formData={
                        formData
                    }

                    handleChange={
                        handleChange
                    }

                />

            );

            break;


        case "decoration":

            categoryContent = (

                <DecorationSection
                />

            );

            break;


        case "makeup":

            categoryContent = (

                <MakeupSection
                />

            );

            break;


        default:

            categoryContent =
                null;

    }


    return (

        <>

            {/* =========================================
                CATEGORY SPECIFIC INFORMATION
            ========================================= */}

            {
                categoryContent
            }


            {/* =========================================
                CATEGORY SPECIFIC AMENITIES
            =========================================

            Only render the section when this category
            has configured amenities.
            ========================================= */}

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