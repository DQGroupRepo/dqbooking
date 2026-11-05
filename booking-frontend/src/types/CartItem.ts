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

    packageType?: "SILVER" | "GOLD" | "PREMIUM";

    packagePrice?: number;

    packageFeatures?: string[];

    selectedCateringDishes?: CartSelectedCateringDish[];
}