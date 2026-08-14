import type { CartItem } from "../types/CartItem";

const CART_STORAGE_KEY =
    "eventnest_cart";


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

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
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
     * CLEAR CART
     * =========================================
     */

    clearCart(): void {

        localStorage.removeItem(
            CART_STORAGE_KEY
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
     *
     * Returns one representative cart item
     * for each unique bundle.
     */

    getCartBundles(): CartItem[] {

        const cart =
            this.getCart();


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
     * GET BUNDLE ITEMS
     * =========================================
     */

    getBundleItems(
        bundleId: string
    ): CartItem[] {

        return this.getCart()
            .filter(
                item =>
                    item.bundleId ===
                    bundleId
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

        return this.getBundleItems(
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
     *
     * Discount is applied ONLY when the
     * complete bundle is present.
     */

    getBundleDiscount(
        bundleId: string
    ): number {

        const bundleItems =
            this.getBundleItems(
                bundleId
            );


        if (
            bundleItems.length === 0
        ) {

            return 0;

        }


        /*
         * Do not apply discount until
         * every required service exists.
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


        const discountValue =
            Number(
                firstItem.bundleDiscountValue ||
                0
            );


        if (
            firstItem.bundleDiscountType ===
            "PERCENTAGE"
        ) {

            return (
                originalPrice *
                (
                    discountValue /
                    100
                )
            );

        }


        if (
            firstItem.bundleDiscountType ===
            "FIXED"
        ) {

            return Math.min(
                discountValue,
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


        return Math.max(
            0,
            originalPrice -
            discount
        );

    }


    /*
     * =========================================
     * GET ITEM BUNDLE DISCOUNT
     * =========================================
     *
     * Calculates how much of the bundle
     * discount belongs to one service.
     *
     * The discount is distributed
     * proportionally according to each
     * service's original price.
     */

    getItemBundleDiscount(
        item: CartItem
    ): number {

        if (
            !item.bundleId
        ) {

            return 0;

        }


        if (
            !this.isBundleComplete(
                item.bundleId
            )
        ) {

            return 0;

        }


        const bundleItems =
            this.getBundleItems(
                item.bundleId
            );


        const bundleOriginalPrice =
            this.getBundleOriginalPrice(
                item.bundleId
            );


        if (
            bundleOriginalPrice <= 0
        ) {

            return 0;

        }


        const totalBundleDiscount =
            this.getBundleDiscount(
                item.bundleId
            );


        const itemOriginalPrice =
            Number(
                item.price
            );


        /*
         * Allocate the bundle discount
         * proportionally to this service.
         */

        const itemDiscount =
            totalBundleDiscount *
            (
                itemOriginalPrice /
                bundleOriginalPrice
            );


        /*
         * Avoid floating-point display
         * issues such as 2499.999999.
         */

        return Number(
            itemDiscount.toFixed(2)
        );

    }


    /*
     * =========================================
     * GET ITEM FINAL PRICE
     * =========================================
     */

    getItemFinalPrice(
        item: CartItem
    ): number {

        const discount =
            this.getItemBundleDiscount(
                item
            );


        return Math.max(
            0,
            Number(
                item.price
            ) -
            discount
        );

    }


    /*
     * =========================================
     * GET ITEM PRICING DETAILS
     * =========================================
     *
     * Convenient helper for the Cart page
     * and Checkout page.
     */

    getItemPricing(
        item: CartItem
    ) {

        const originalPrice =
            Number(
                item.price
            );


        const discount =
            this.getItemBundleDiscount(
                item
            );


        const finalPrice =
            Math.max(
                0,
                originalPrice -
                discount
            );


        return {

            originalPrice,

            discount,

            finalPrice,

            bundleApplied:
                discount > 0

        };

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

        return Math.max(
            0,
            this.getSubtotal() -
            this.getTotalDiscount()
        );

    }


    /*
     * =========================================
     * REMOVE BUNDLE ASSOCIATION
     * =========================================
     *
     * Used when switching bundles.
     *
     * Services remain in the cart but
     * lose their old bundle association.
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