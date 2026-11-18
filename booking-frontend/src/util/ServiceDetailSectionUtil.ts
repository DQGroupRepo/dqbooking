import type {
    ServiceAttribute
} from "../types/ServiceAttribute";

import type {
    ServiceDetailSection
} from "../types/ServiceDetailSection";


/* =========================================
   ATTRIBUTE DEFINITION
========================================= */

export interface AttributeDefinition {

    key: string;

    label: string;

    type:
        | "text"
        | "number"
        | "checkbox";

    placeholder?: string;

}


/* =========================================
   SECTION DEFINITION
========================================= */

export interface SectionDefinition {

    key: string;

    title: string;

    subtitle?: string;

    attributes: AttributeDefinition[];

}


/* =========================================
   HALL CONFIGURATION
========================================= */

const hallSections:
    SectionDefinition[] = [

    {

        key: "hallInformation",

        title: "Hall Information",

        subtitle:
            "Provide additional details about your venue.",

        attributes: [

            {

                key: "hallCapacity",

                label: "Hall Capacity",

                type: "number",

                placeholder: "500"

            },

            {

                key: "diningCapacity",

                label: "Dining Capacity",

                type: "number",

                placeholder: "300"

            },

            {

                key: "rooms",

                label: "Number of Rooms",

                type: "number",

                placeholder: "10"

            },

            {

                key: "parkingCapacity",

                label: "Parking Capacity",

                type: "number",

                placeholder: "100"

            }

        ]

    },



];


/* =========================================
   CATEGORY SECTION DEFINITIONS

   This is the central registry.

   Add future categories here.
========================================= */

const categorySections:
    Record<
        string,
        SectionDefinition[]
    > = {

    HALL:
        hallSections

};


/* =========================================
   GET CATEGORY DEFINITIONS
========================================= */

export function getCategorySections(
    category: string
): SectionDefinition[] {

    return (
        categorySections[
            category
                ?.toUpperCase()
                .trim()
        ] ?? []
    );

}


/* =========================================
   BUILD DETAIL SECTIONS

   Converts generic form values into:

   [
       {
           key,
           title,
           attributes: [
               { key, value }
           ]
       }
   ]
========================================= */

export function buildDetailSections(

    category: string,

    formData:
        Record<
            string,
            unknown
        >

): ServiceDetailSection[] {


    const sections =
        getCategorySections(
            category
        );


    return sections

        .map(
            section => {


                const attributes:
                    ServiceAttribute[] =

                    section.attributes

                        .map(
                            attribute => {


                                const value =
                                    formData[
                                        attribute.key
                                    ];


                                /*
                                 * Ignore fields that
                                 * have not been entered.
                                 */
                                if (

                                    value === undefined ||

                                    value === null ||

                                    value === ""

                                ) {

                                    return null;

                                }


                                return {

                                    key:
                                        attribute.key,

                                    value:
                                        String(
                                            value
                                        )

                                };

                            }
                        )

                        .filter(
                            (
                                attribute
                            ): attribute is ServiceAttribute =>

                                attribute !== null
                        );


                /*
                 * Do not create
                 * empty sections.
                 */
                if (
                    attributes.length === 0
                ) {

                    return null;

                }


                return {

                    key:
                        section.key,

                    title:
                        section.title,

                    attributes

                };

            }
        )

        .filter(
            (
                section
            ): section is ServiceDetailSection =>

                section !== null
        );

}