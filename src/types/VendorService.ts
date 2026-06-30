export interface ServicePackage {

    id: number;

    name: string;

    price: number;

    description: string;

}

export interface VendorService {

    id: number;

    name: string;

    category: string;

    description: string;

    city: string;

    address: string;

    price: number;

    rating: number;

    reviewCount: number;

    capacity: number;

    image: string;

    status: "Active" | "Inactive";

    amenities: string[];

    gallery: string[];

    packages: ServicePackage[];

    upcomingBookings: string[];

}