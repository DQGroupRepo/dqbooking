import type { VendorCategory } from "../types/VendorCategory";

export const mockVendorCategories: VendorCategory[] = [
  {
    id: 1,
    name: "Wedding Hall",
    slug: "hall",
    description: "Banquet halls, convention centers and marriage halls.",
    icon: "🏛️",
    fields: ["hallCapacity", "diningCapacity", "parkingCapacity", "rooms"],
  },

  {
    id: 2,
    name: "Photography",
    slug: "photography",
    description: "Wedding, candid and event photographers.",
    icon: "📸",
    fields: ["albums", "deliveryDays", "videography"],
  },

  {
    id: 3,
    name: "Makeup Artist",
    slug: "makeup",
    description: "Bridal and professional makeup artists.",
    icon: "💄",
    fields: [],
  },

  {
    id: 4,
    name: "Decoration",
    slug: "decoration",
    description: "Stage decoration and floral arrangements.",
    icon: "🎉",
    fields: [],
  },

  {
    id: 5,
    name: "Catering",
    slug: "catering",
    description: "Veg, non-veg and multi-cuisine catering.",
    icon: "🍽️",
    fields: ["menu", "serviceType"],
  },

  {
    id: 6,
    name: "Stays",
    slug: "stay",
    description: "Hotels, resorts, homestays, rooms and day-use packages.",
    icon: "🛏️",
    fields: ["amenities", "dayPackages"],
  },
];
