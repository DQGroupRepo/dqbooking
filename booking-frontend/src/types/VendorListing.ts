export interface VendorListing {

    serviceId: string;

    serviceName: string;

    businessName: string;

    description: string;

    category: string;

    city: string;

    startingPrice: number;

    rating: number;

    reviewCount: number;

    capacity: number;

    imageUrl?: string;

    gallery?: string[];

    amenities?: string[];

    isActive: boolean;

}