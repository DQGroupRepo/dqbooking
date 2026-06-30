import type { VendorService } from "../types/VendorService";

export const mockVendorServices: VendorService[] = [

    {
        id: 1,
        name: "Royal Palace Hall",
        category: "Wedding Hall",
        description: "Luxury wedding hall suitable for large family events.",
        city: "Chennai",
        address: "Anna Salai, Chennai",
        price: 85000,
        rating: 4.8,
        reviewCount: 156,
        capacity: 600,
        image: "https://picsum.photos/200/120?1",
        status: "Active",
        amenities: [
            "Air Conditioned Hall",
            "Dining Hall",
            "Parking",
            "Bridal Room",
            "Generator Backup",
            "WiFi"
        ],

        gallery: [
            "https://picsum.photos/900/500?1",
            "https://picsum.photos/900/500?2",
            "https://picsum.photos/900/500?3"
        ],

        packages: [

            {
                id: 1,
                name: "Basic",
                price: 65000,
                description: "Hall Rental"
            },

            {
                id: 2,
                name: "Premium",
                price: 85000,
                description: "Hall + Decoration"
            },

            {
                id: 3,
                name: "Luxury",
                price: 120000,
                description: "Complete Wedding Package"
            }

        ],

        upcomingBookings: [
            "15 Jul 2026",
            "28 Jul 2026",
            "12 Aug 2026"
        ]
    },

    {
        id: 2,
        name: "Elite Photography",
        category: "Photography",
        description: "Professional wedding and candid photography.",
        city: "Chennai",
        address: "Velachery",
        price: 35000,
        rating: 4.6,
        reviewCount: 92,
        capacity: 0,
        image: "https://picsum.photos/200/120?2",
        status: "Active",
        amenities: [],
        gallery: [],
        packages: [],
        upcomingBookings: []
    },

    {
        id: 3,
        name: "Classic Catering",
        category: "Catering",
        description: "South Indian & Multi Cuisine Catering.",
        city: "Chennai",
        address: "Tambaram",
        price: 65000,
        rating: 4.7,
        reviewCount: 210,
        capacity: 1000,
        image: "https://picsum.photos/200/120?3",
        status: "Active",
        amenities: [],
        gallery: [],
        packages: [],
        upcomingBookings: []
    },

    {
        id: 4,
        name: "Luxury Decoration",
        category: "Decoration",
        description: "Wedding stage and floral decorations.",
        city: "Chennai",
        address: "T Nagar",
        price: 42000,
        rating: 4.4,
        reviewCount: 68,
        capacity: 0,
        image: "https://picsum.photos/200/120?4",
        status: "Inactive",
        amenities: [],
        gallery: [],
        packages: [],
        upcomingBookings: []
    },

    {
        id: 5,
        name: "Bridal Makeup Studio",
        category: "Makeup Artist",
        description: "HD Bridal Makeup with premium cosmetics.",
        city: "Chennai",
        address: "Adyar",
        price: 18000,
        rating: 4.9,
        reviewCount: 184,
        capacity: 0,
        image: "https://picsum.photos/200/120?5",
        status: "Active",
        amenities: [],
        gallery: [],
        packages: [],
        upcomingBookings: []
    }

];