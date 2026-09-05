import type { CartItem } from "../types/CartItem";

const CART_STORAGE_KEY = "eventnest_cart";

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
     * ADD ITEM
     * =========================================
     */

    addItem(
        item: CartItem
    ): CartItem[] {
console.log("addItem:", item);
        const cart =
            this.getCart();

        const alreadyExists =
            cart.some(
                cartItem =>
                    cartItem.serviceId ===
                    item.serviceId
            );

        if (!alreadyExists) {

            cart.push(item);

        }

        this.saveCart(
            cart
        );

        return cart;

    }


    /*
     * =========================================
     * REMOVE ITEM
     * =========================================
     *
     * Removes only one service.
     *
     * If that service belongs to a bundle,
     * the caller can separately remove the
     * bundle association from the remaining
     * services.
     */

    removeItem(
        serviceId: string
    ): CartItem[] {

        const cart =
            this.getCart()
                .filter(
                    item =>
                        item.serviceId !==
                        serviceId
                );

        this.saveCart(
            cart
        );

        return cart;

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

    removeItemFromBundle(
        serviceId: string,
        bundleId: string
    ): CartItem[] {

        const cart =
            this.getCart()
                .filter(
                    item =>
                        item.serviceId !==
                        serviceId
                )
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


    /*
     * =========================================
     * REMOVE ENTIRE BUNDLE
     * =========================================
     *
     * Removes every service belonging to
     * the specified bundle.
     */

    removeBundle(
        bundleId: string
    ): CartItem[] {

        const cart =
            this.getCart()
                .filter(
                    item =>
                        item.bundleId !==
                        bundleId
                );

        this.saveCart(
            cart
        );

        return cart;

    }


    /*
     * =========================================
     * CLEAR CART
     * =========================================
     */

    clearCart(): void {

        localStorage.removeItem(
            CART_STORAGE_KEY
        );


        /*
         * Notify Header and other
         * components that cart changed.
         */

        window.dispatchEvent(
            new Event(
                "cartUpdated"
            )
        );

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