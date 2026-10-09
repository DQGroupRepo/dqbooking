export interface CateringPackageDish {
    id: string;

    menuItemId?: string;

    dishId?: string;

    name: string;

    category: string;

    foodType: string;

    custom: boolean;
}


export interface CateringPackageMenu {

    /*
     * =========================================
     * SELECTION LIMITS
     * =========================================
     */

    vegetarianSelectionLimit: number;

    nonVegetarianSelectionLimit: number;

    soupSelectionLimit: number;

    dessertSelectionLimit: number;


    /*
     * =========================================
     * AVAILABLE DISHES
     * =========================================
     */

    vegetarianDishes: CateringPackageDish[];

    nonVegetarianDishes: CateringPackageDish[];

    soupDishes: CateringPackageDish[];

    dessertDishes: CateringPackageDish[];

}