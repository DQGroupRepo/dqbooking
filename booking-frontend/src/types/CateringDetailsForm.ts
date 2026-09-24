import type {
    CateringMenuItem
} from "./CateringMenuItem";


export interface CateringDetailsForm {

    vegetarian: boolean;

    nonVegetarian: boolean;

    cuisines: string[];

    menuItems: CateringMenuItem[];

    providesCateringStaff: boolean;

    staffCostPerPerson: string;

    maximumServiceDistanceKm: string;

}