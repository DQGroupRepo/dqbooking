import type { Vendor } from "../types/Vendor";

export const mockVendors: Vendor[] = [
  {
    id: 1,
    businessName: "Royal Palace Convention Hall",
    description:
      "Premium event venue suitable for weddings, receptions and corporate events.",
    category: "Wedding Hall",
    city: "Chennai",
    rating: 4.8,
    reviewCount: 256,
    startingPrice: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
    gallery: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3"
    ],
    amenities: [
      "Parking",
      "AC Hall",
      "Generator",
      "Guest Rooms",
      "Catering Area"
    ],
    capacity: 500
  },
  {
    id: 2,
    businessName: "Elegant Wedding Venue",
    description: "Luxury wedding venue",
    category: "Wedding Hall",
    city: "Bangalore",
    rating: 4.9,
    reviewCount: 190,
    startingPrice: 75000,
    imageUrl:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
    amenities: ["Parking", "Catering", "Decoration"],
    capacity: 800
  },
  {
    id: 3,
    businessName: "Grand Celebration Hall",
    description: "Indoor and outdoor venue",
    category: "Wedding Hall",
    city: "Hyderabad",
    rating: 4.7,
    reviewCount: 140,
    startingPrice: 38000,
    imageUrl:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
    amenities: ["Parking", "AC Hall"],
    capacity: 350
  }
];