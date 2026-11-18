export interface CartSelectedCateringDish {
    dishId?: string;
    menuItemId?: string;
    id?: string;
    name: string;
    category: string;
    foodType: string;
    custom: boolean;
}

export interface CartItem {
    serviceId: string;

    vendorId: string;

    vendorName: string;

    serviceName: string;

    category?: string;

    price: number;

    quantity?: number;

    image?: string;

    eventDate?: string;

    // STAY bookings use the explicit interval; eventDate remains for
    // backward compatibility with all existing non-STAY categories.
    bookingFrom?: string;
    bookingTo?: string;
    bookingIntervals?: { from: string; to: string }[];
    bookingDuration?: number;
    pricingBasis?: "PER_DAY" | "PER_NIGHT" | "FIXED";
    bookingType?: "ROOM_STAY" | "STANDARD_SLOT" | "DAY_PACKAGE";
    roomQuantity?: number;

    guestCount?: number;

    /*
     * =========================================
     * BOOKING SLOT
     * =========================================
     */

    slotId?: string;

    slotName?: string;

    slotStartTime?: string;

    slotEndTime?: string;

    /*
     * Temporary backend hold.
     *
     * The hold belongs to this cart item.
     */

    holdId?: string;

    // Multiple independently-created holds can be represented as one visible
    // cart line when every booking selection dimension is identical.
    holds?: { holdId: string; roomQuantity?: number; quantity?: number; expiresAt?: string; price?: number }[];

    holdExpiresAt?: string;

    /*
     * =========================================
     * BUNDLE INFORMATION
     * =========================================
     */

    bundleEnabled?: boolean;

    bundleId?: string;

    bundleName?: string;

    bundleDescription?: string;

    bundleServiceIds?: string[];

    bundleDiscountType?: "PERCENTAGE" | "FIXED";

    bundleDiscountValue?: number;

    packageId?: string;

    resourceRequirements?: { resourceTypeId: string; quantity: number }[];

    packageType?: "SILVER" | "GOLD" | "PREMIUM" | "FIXED_DURATION";
    includedDuration?: number;

    packagePrice?: number;

    packageFeatures?: string[];

    selectedCateringDishes?: CartSelectedCateringDish[];
}