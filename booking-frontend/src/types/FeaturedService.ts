export interface FeaturedService {
  serviceId: string;
  businessName: string;
  description: string;
  city: string;
  startingPrice: number;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string | null;
}
