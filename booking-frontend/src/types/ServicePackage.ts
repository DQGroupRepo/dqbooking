import type {
    CateringPackageMenu
} from "./CateringPackageMenu";

export interface CateringPackageDish {
    id?: string;
    menuItemId?: string;
    dishId?: string;
    name: string;
    category?: string;
    foodType?: string;
    custom?: boolean;
}

export interface CateringPackageMenu {
    vegetarianSelectionLimit: number;
    nonVegetarianSelectionLimit: number;
    soupSelectionLimit: number;
    dessertSelectionLimit: number;
    vegetarianDishes: CateringPackageDish[];
    nonVegetarianDishes: CateringPackageDish[];
    soupDishes: CateringPackageDish[];
    dessertDishes: CateringPackageDish[];
}

export interface ServicePackage {
    id?: string;
    name: string;
    price: number;
    features: string[];
    active: boolean;

    // Support both the current backend and frontend property names.
    cateringPackageMenu?: CateringPackageMenu | null;
    cateringMenu?: CateringPackageMenu | null;
}