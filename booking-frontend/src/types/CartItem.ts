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
}