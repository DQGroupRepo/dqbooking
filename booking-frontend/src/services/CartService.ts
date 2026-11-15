import type { CartItem } from "../types/CartItem";
import BookingAvailabilityService from "./BookingAvailabilityService";

const CART_STORAGE_KEY = "eventnest_cart";
const CART_ID_STORAGE_KEY = "eventnest_cart_id";

class CartService {

    /*
     * =========================================
     * GET CART
     * =========================================
     */

    getCart(): CartItem[] {

        const storedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );

        if (!storedCart) {
            return [];
        }

        try {

            const cart =
                JSON.parse(
                    storedCart
                );

            if (!Array.isArray(cart)) {
                return [];
            }

            return cart;

        } catch (error) {

            console.error(
                "Failed to parse cart:",
                error
            );

            return [];

        }

    }


    /*
     * =========================================
     * SAVE CART
     * =========================================
     */

    saveCart(
        cart: CartItem[]

    ): void {

        console.log(
            "saveCart:",
            cart
        );

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );


        /*
         * Notify components in the
         * current browser tab that
         * the cart has changed.
         */

        window.dispatchEvent(
            new Event(
                "cartUpdated"
            )
        );

    }


    /*
     * =========================================
     * CART ID
     * =========================================
     *
     * Stable identifier shared by holds created
     * for this browser cart.
     */

    getOrCreateCartId(): string {

        let cartId = localStorage.getItem(CART_ID_STORAGE_KEY);

        if (!cartId) {
            cartId = `cart-${Date.now()}-${Math.random().toString(36).slice(2)}`;

            localStorage.setItem(CART_ID_STORAGE_KEY, cartId);
        }

        return cartId;
    }


    /*
     * =========================================
     * RELEASE HOLD (BEST EFFORT)
     * =========================================
     *
     * The backend remains authoritative. If release
     * fails, the hold expires automatically after
     * its five-minute lifetime.
     */

    private async releaseHold(item: CartItem): Promise<void> {

        const holdIds = Array.from(new Set([
            ...(item.holds ?? []).map(hold => hold.holdId),
            ...(item.holdId ? [item.holdId] : [])
        ].filter(Boolean)));

        await Promise.all(holdIds.map(async holdId => {
            try {
                await BookingAvailabilityService.releaseHold(item.serviceId, holdId);
            } catch (error) {
                console.warn(
                    `Could not release hold ${holdId}; it will expire automatically.`,
                    error
                );
            }
        }));
    }


    private async releaseHolds(items: CartItem[]): Promise<void> {
        await Promise.all(items.map(item => this.releaseHold(item)));
    }


    private withoutBundleAssociation(item: CartItem): CartItem {

        const {
            bundleId: _bundleId,
            bundleName: _bundleName,
            bundleDescription: _bundleDescription,
            bundleServiceIds: _bundleServiceIds,
            bundleDiscountType: _bundleDiscountType,
            bundleDiscountValue: _bundleDiscountValue,
            bundleEnabled: _bundleEnabled,
            ...normalItem
        } = item;

        return normalItem;
    }


    /*
     * =========================================
     * ADD / REPLACE ITEM
     * =========================================
     *
     * Call only after the customer confirms a
     * duplicate and the new hold has been secured.
     * Save the new cart first, then release the old
     * hold. A failed local save therefore does not
     * discard the previous booking.
     */

    async replaceItem(item: CartItem): Promise<CartItem[]> {

        const cart = this.getCart();
        const requirementsKey = (value: CartItem) => JSON.stringify(
            (value.resourceRequirements ?? [])
                .map(requirement => `${requirement.resourceTypeId}:${requirement.quantity}`)
                .sort()
        );
        const sameBookingSelection = (cartItem: CartItem) =>
            String(item.category ?? "").toUpperCase() === "STAY" &&
            !cartItem.bundleId && !item.bundleId &&
            cartItem.serviceId === item.serviceId &&
            cartItem.slotId === item.slotId &&
            cartItem.packageId === item.packageId &&
            (cartItem.bookingFrom ?? cartItem.eventDate ?? "").slice(0, 16) ===
                (item.bookingFrom ?? item.eventDate ?? "").slice(0, 16) &&
            (cartItem.bookingTo ?? cartItem.eventDate ?? "").slice(0, 16) ===
                (item.bookingTo ?? item.eventDate ?? "").slice(0, 16) &&
            requirementsKey(cartItem) === requirementsKey(item);
        const existingIndex = cart.findIndex(sameBookingSelection);

        if (existingIndex >= 0) {
            const existing = cart[existingIndex];
            const existingHolds = existing.holds?.length
                ? existing.holds
                : existing.holdId
                    ? [{ holdId: existing.holdId, roomQuantity: existing.roomQuantity, quantity: existing.quantity, expiresAt: existing.holdExpiresAt, price: existing.price }]
                    : [];
            const newHolds = item.holds?.length
                ? item.holds
                : item.holdId
                    ? [{ holdId: item.holdId, roomQuantity: item.roomQuantity, quantity: item.quantity, expiresAt: item.holdExpiresAt, price: item.price }]
                    : [];
            const mergedHolds = [...existingHolds, ...newHolds].filter(
                (hold, index, all) => all.findIndex(candidate => candidate.holdId === hold.holdId) === index
            );
            const mergedRoomQuantity = mergedHolds.reduce(
                (sum, hold) => sum + Number(hold.roomQuantity ?? hold.quantity ?? 1), 0
            );
            const mergedQuantity = mergedHolds.reduce(
                (sum, hold) => sum + Number(hold.quantity ?? hold.roomQuantity ?? 1), 0
            );
            const merged: CartItem = {
                ...existing,
                holds: mergedHolds,
                holdId: mergedHolds[0]?.holdId,
                holdExpiresAt: mergedHolds.reduce<string | undefined>((earliest, hold) => {
                    if (!hold.expiresAt) return earliest;
                    return !earliest || Date.parse(hold.expiresAt) < Date.parse(earliest)
                        ? hold.expiresAt : earliest;
                }, undefined),
                roomQuantity: existing.bookingType === "ROOM_STAY" ? mergedRoomQuantity : existing.roomQuantity,
                quantity: mergedQuantity,
                price: mergedHolds.reduce((sum, hold) => sum + Number(hold.price ?? 0), 0) ||
                    Number(existing.price) + Number(item.price)
            };
            const nextCart = [...cart];
            nextCart[existingIndex] = merged;
            this.saveCart(nextCart);
            return nextCart;
        }

        const nextCart = [...cart, item];
        this.saveCart(nextCart);
        return nextCart;
    }

    /*
     * ADD ITEM COMPATIBILITY ALIAS
     *
     * New booking flows should ask for duplicate confirmation
     * before calling this method. It delegates to replaceItem
     * so an existing hold is never silently orphaned.
     */

    async addItem(item: CartItem): Promise<CartItem[]> {
        return this.replaceItem(item);
    }


    /*
     * =========================================
     * REMOVE ITEM
     * =========================================
     *
     * Releases the removed service's hold. If it was
     * part of a bundle, the remaining members become
     * normal services so an incomplete bundle cannot
     * retain a discount association.
     */

    async removeItem(serviceId: string, holdId?: string): Promise<CartItem[]> {
        const cart = this.getCart();
        const removed = cart.filter(item => item.serviceId === serviceId &&
            (!holdId || item.holdId === holdId));
        const removedBundleIds = new Set(removed.map(item => item.bundleId).filter((id): id is string => Boolean(id)));
        const nextCart = cart
            .filter(item => !(item.serviceId === serviceId && (!holdId || item.holdId === holdId)))
            .map(item => item.bundleId && removedBundleIds.has(item.bundleId)
                ? this.withoutBundleAssociation(item)
                : item);
        this.saveCart(nextCart);
        await this.releaseHolds(removed);
        return nextCart;
    }

    // Remove one underlying hold when the backend reports that specific hold
    // as expired. Other holds represented by the same visible cart line remain.
    async removeHold(serviceId: string, holdId: string): Promise<CartItem[]> {
        const cart = this.getCart();
        const removed: CartItem[] = [];
        const nextCart: CartItem[] = [];

        cart.forEach(item => {
            if (item.serviceId !== serviceId) {
                nextCart.push(item);
                return;
            }
            const holds = item.holds?.length
                ? item.holds
                : item.holdId
                    ? [{ holdId: item.holdId, roomQuantity: item.roomQuantity, quantity: item.quantity, expiresAt: item.holdExpiresAt, price: item.price }]
                    : [];
            const matching = holds.filter(hold => hold.holdId === holdId);
            if (!matching.length) {
                nextCart.push(item);
                return;
            }
            removed.push({ ...item, holds: matching, holdId: matching[0].holdId });
            const remaining = holds.filter(hold => hold.holdId !== holdId);
            if (!remaining.length) return;
            const roomQuantity = remaining.reduce((sum, hold) => sum + Number(hold.roomQuantity ?? hold.quantity ?? 1), 0);
            const quantity = remaining.reduce((sum, hold) => sum + Number(hold.quantity ?? hold.roomQuantity ?? 1), 0);
            const remainingPrice = remaining.reduce((sum, hold) => sum + Number(hold.price ?? 0), 0);
            nextCart.push({
                ...item,
                holds: remaining,
                holdId: remaining[0].holdId,
                holdExpiresAt: remaining.reduce<string | undefined>((earliest, hold) => {
                    if (!hold.expiresAt) return earliest;
                    return !earliest || Date.parse(hold.expiresAt) < Date.parse(earliest) ? hold.expiresAt : earliest;
                }, undefined),
                roomQuantity: item.bookingType === "ROOM_STAY" ? roomQuantity : item.roomQuantity,
                quantity,
                price: remainingPrice || item.price
            });
        });
        this.saveCart(nextCart);
        await this.releaseHolds(removed);
        return nextCart;
    }


    /*
     * =========================================
     * REMOVE ITEM FROM BUNDLE
     * =========================================
     *
     * Removes one service and removes the
     * bundle association from all remaining
     * services belonging to that bundle.
     *
     * This means:
     *
     * Service A -> removed
     * Service B -> normal service
     * Service C -> normal service
     *
     * Bundle discount -> removed
     */

    async removeItemFromBundle(
        serviceId: string,
        bundleId: string
    ): Promise<CartItem[]> {

        const cart = this.getCart();
        const removed = cart.filter(item => item.serviceId === serviceId && item.bundleId === bundleId);
        const nextCart = cart
            .filter(item => !(item.serviceId === serviceId && item.bundleId === bundleId))
            .map(item =>
                item.bundleId === bundleId
                    ? this.withoutBundleAssociation(item)
                    : item
            );

        this.saveCart(nextCart);
        await this.releaseHolds(removed);

        return nextCart;
    }


    /*
     * =========================================
     * REMOVE ENTIRE BUNDLE
     * =========================================
     *
     * Removes every service belonging to
     * the specified bundle.
     */

    async removeBundle(bundleId: string): Promise<CartItem[]> {

        const cart = this.getCart();
        const removed = cart.filter(item => item.bundleId === bundleId);
        const nextCart = cart.filter(item => item.bundleId !== bundleId);

        this.saveCart(nextCart);
        await this.releaseHolds(removed);

        return nextCart;
    }


    /*
     * =========================================
     * CLEAR CART
     * =========================================
     */

    async clearCart(authToken?: string | null): Promise<void> {

        const cart = this.getCart();

        // Clear locally immediately so the UI cannot continue to use stale
        // holds; release calls are best-effort and holds expire as fallback.
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_ID_STORAGE_KEY);
        window.dispatchEvent(new Event("cartUpdated"));

        // Authentication is supplied by the shared Axios request interceptor.
        // Retain the optional argument for compatibility with existing callers.
        void authToken;
        await this.releaseHolds(cart);
    }


    /*
     * =========================================
     * ITEM COUNT
     * =========================================
     */

    getItemCount(): number {

        return this.getCart().length;

    }


    /*
     * =========================================
     * RAW SUBTOTAL
     * =========================================
     *
     * Total before bundle discount.
     */

    getSubtotal(): number {

        return this.getCart()
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.price
                    ),
                0
            );

    }


    /*
     * =========================================
     * HAS ITEM
     * =========================================
     */

    hasItem(
        serviceId: string
    ): boolean {

        return this.getCart()
            .some(
                item =>
                    item.serviceId ===
                    serviceId
            );

    }


    /*
     * =========================================
     * GET ACTIVE BUNDLES
     * =========================================
     */

    getCartBundles(): CartItem[] {

        const cart =
            this.getCart();
console.log("getCartBundles:", cart);
        const bundles: CartItem[] = [];

        cart.forEach(
            item => {

                if (
                    !item.bundleId
                ) {

                    return;

                }

                const alreadyExists =
                    bundles.some(
                        bundle =>
                            bundle.bundleId ===
                            item.bundleId
                    );

                if (!alreadyExists) {

                    bundles.push(
                        item
                    );

                }

            }
        );

        return bundles;

    }


    /*
     * =========================================
     * CHECK WHETHER BUNDLE IS COMPLETE
     * =========================================
     */

    isBundleComplete(
        bundleId: string
    ): boolean {

        const cart =
            this.getCart();
console.log("isBundleComplete:", cart);
        const bundleItems =
            cart.filter(
                item =>
                    item.bundleId ===
                    bundleId
            );

        if (
            bundleItems.length === 0
        ) {

            return false;

        }

        const requiredServiceIds =
            bundleItems[0]
                .bundleServiceIds;

        if (
            !requiredServiceIds ||
            requiredServiceIds.length === 0
        ) {

            return false;

        }

        return requiredServiceIds.every(
            serviceId =>
                cart.some(
                    item =>
                        item.serviceId ===
                        serviceId &&
                        item.bundleId ===
                        bundleId
                )
        );

    }


    /*
     * =========================================
     * GET BUNDLE ORIGINAL PRICE
     * =========================================
     */

    getBundleOriginalPrice(
        bundleId: string
    ): number {

        return this.getCart()
            .filter(
                item =>
                    item.bundleId ===
                    bundleId
            )
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.price
                    ),
                0
            );

    }


    /*
     * =========================================
     * GET BUNDLE DISCOUNT
     * =========================================
     */

    getBundleDiscount(
        bundleId: string
    ): number {

        const cart =
            this.getCart();

        const bundleItems =
            cart.filter(
                item =>
                    item.bundleId ===
                    bundleId
            );

        if (
            bundleItems.length === 0
        ) {

            return 0;

        }

        /*
         * Discount is applied only when
         * the complete bundle exists.
         */

        if (
            !this.isBundleComplete(
                bundleId
            )
        ) {

            return 0;

        }

        const firstItem =
            bundleItems[0];

        const originalPrice =
            this.getBundleOriginalPrice(
                bundleId
            );

        if (
            firstItem.bundleDiscountType ===
            "PERCENTAGE"
        ) {

            return (
                originalPrice *
                (
                    Number(
                        firstItem.bundleDiscountValue ||
                        0
                    ) / 100
                )
            );

        }

        if (
            firstItem.bundleDiscountType ===
            "FIXED"
        ) {

            return Math.min(
                Number(
                    firstItem.bundleDiscountValue ||
                    0
                ),
                originalPrice
            );

        }

        return 0;

    }


    /*
     * =========================================
     * GET BUNDLE FINAL PRICE
     * =========================================
     */

    getBundleFinalPrice(
        bundleId: string
    ): number {

        const originalPrice =
            this.getBundleOriginalPrice(
                bundleId
            );

        const discount =
            this.getBundleDiscount(
                bundleId
            );

        return (
            originalPrice -
            discount
        );

    }


    /*
     * =========================================
     * GET TOTAL DISCOUNT
     * =========================================
     */

    getTotalDiscount(): number {

        const bundles =
            this.getCartBundles();

        return bundles.reduce(
            (
                total,
                bundle
            ) =>
                total +
                this.getBundleDiscount(
                    bundle.bundleId!
                ),
            0
        );

    }


    /*
     * =========================================
     * GET FINAL TOTAL
     * =========================================
     */

    getFinalTotal(): number {

        return (
            this.getSubtotal() -
            this.getTotalDiscount()
        );

    }


    /*
     * =========================================
     * REMOVE BUNDLE ASSOCIATION
     * =========================================
     */

    removeBundleAssociation(
        bundleId: string
    ): CartItem[] {

        const cart =
            this.getCart()
                .map(
                    item => {

                        if (
                            item.bundleId !==
                            bundleId
                        ) {

                            return item;

                        }

                        const {
                            bundleId:
                                _bundleId,

                            bundleName:
                                _bundleName,

                            bundleDescription:
                                _bundleDescription,

                            bundleServiceIds:
                                _bundleServiceIds,

                            bundleDiscountType:
                                _bundleDiscountType,

                            bundleDiscountValue:
                                _bundleDiscountValue,

                            bundleEnabled:
                                _bundleEnabled,

                            ...normalItem

                        } = item;

                        return normalItem;

                    }
                );

        this.saveCart(
            cart
        );

        return cart;

    }

}


export default new CartService();