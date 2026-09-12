export interface ServiceDetailAttributeConfig {

    /*
     * Key stored in backend.
     */
    key: string;


    /*
     * Field in VendorServiceForm.
     */
    field: string;

}


export interface ServiceDetailSectionConfig {

    /*
     * Generic section identifier.
     */
    key: string;


    /*
     * Human-readable title.
     */
    title: string;


    /*
     * Attributes belonging
     * to this section.
     */
    attributes:
        ServiceDetailAttributeConfig[];

}

export const SERVICE_DETAIL_SECTION_CONFIG:
    Record<
        string,
        ServiceDetailSectionConfig[]
    > = {

    HALL: [

        {
            key: "hallInformation",

            title: "Hall Information",

            attributes: [

                {
                    key: "hallCapacity",
                    field: "hallCapacity"
                },

                {
                    key: "diningCapacity",
                    field: "diningCapacity"
                },

                {
                    key: "parkingCapacity",
                    field: "parkingCapacity"
                },

                {
                    key: "rooms",
                    field: "rooms"
                }

            ]

        },

        {
            key: "venueFacilities",

            title: "Venue Facilities",

            attributes: [

                {
                    key: "parking",
                    field: "parking"
                },

                {
                    key: "acHall",
                    field: "acHall"
                },

                {
                    key: "generator",
                    field: "generator"
                },

                {
                    key: "diningHall",
                    field: "diningHall"
                },

                {
                    key: "outdoorVenue",
                    field: "outdoorVenue"
                },

                {
                    key: "bridalRoom",
                    field: "bridalRoom"
                }

            ]

        }

    ],


    CATERING: [

        {
            key: "cateringInformation",

            title: "Catering Information",

            attributes: [

                {
                    key: "cuisine",
                    field: "cuisine"
                },

                {
                    key: "foodType",
                    field: "foodType"
                },

                {
                    key: "minimumGuests",
                    field: "minimumGuests"
                },

                {
                    key: "maximumGuests",
                    field: "maximumGuests"
                }

            ]

        },

        {
            key: "serviceOptions",

            title: "Service Options",

            attributes: [

                {
                    key: "buffetService",
                    field: "buffetService"
                },

                {
                    key: "plateService",
                    field: "plateService"
                },

                {
                    key: "liveCounters",
                    field: "liveCounters"
                },

                {
                    key: "outsideCatering",
                    field: "outsideCatering"
                }

            ]

        }

    ],


    PHOTOGRAPHY: [

        {
            key: "photographyInformation",

            title: "Photography Information",

            attributes: [

                {
                    key: "teamSize",
                    field: "teamSize"
                },

                {
                    key: "deliveryTime",
                    field: "deliveryTime"
                }

            ]

        },

        {
            key: "photographyFeatures",

            title: "Photography Features",

            attributes: [

                {
                    key: "droneAvailable",
                    field: "droneAvailable"
                },

                {
                    key: "cinematicVideo",
                    field: "cinematicVideo"
                },

                {
                    key: "albumIncluded",
                    field: "albumIncluded"
                },

                {
                    key: "rawFilesIncluded",
                    field: "rawFilesIncluded"
                }

            ]

        }

    ],


    DECORATION: [

        {
            key: "decorationServices",

            title: "Decoration Services",

            attributes: [

                {
                    key: "floralDecoration",
                    field: "floralDecoration"
                },

                {
                    key: "balloonDecoration",
                    field: "balloonDecoration"
                },

                {
                    key: "stageDecoration",
                    field: "stageDecoration"
                },

                {
                    key: "lighting",
                    field: "lighting"
                },

                {
                    key: "mandapDecoration",
                    field: "mandapDecoration"
                },

                {
                    key: "themeDecoration",
                    field: "themeDecoration"
                }

            ]

        }

    ],


    MAKEUP: [

        {
            key: "makeupInformation",

            title: "Makeup Information",

            attributes: [

                {
                    key: "brandsUsed",
                    field: "brandsUsed"
                }

            ]

        },

        {
            key: "makeupServices",

            title: "Makeup Services",

            attributes: [

                {
                    key: "homeService",
                    field: "homeService"
                },

                {
                    key: "trialAvailable",
                    field: "trialAvailable"
                },

                {
                    key: "bridalMakeup",
                    field: "bridalMakeup"
                },

                {
                    key: "groomMakeup",
                    field: "groomMakeup"
                }

            ]

        }

    ]

};