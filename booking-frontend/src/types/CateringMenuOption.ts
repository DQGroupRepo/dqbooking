export interface CateringMenuOption {

    id: string;

    dishId?: string;

     /*
     * VendorCateringMenuItem ID.
     *
     * Important for existing custom dishes
     * and existing selected standard dishes.
     */
     menuItemId?: string;

    name: string;

    cuisine: string;

    category: string;

    foodType: string;

    pricePerPerson?: number;

    active: boolean;

    custom: boolean;

    selected: boolean;

}