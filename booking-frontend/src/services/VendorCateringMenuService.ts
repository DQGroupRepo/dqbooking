import api from "../api/axiosConfig";

import type { CateringMenuItem } from "../types/CateringMenuItem";
import type { CateringMenuOption } from "../types/CateringMenuOption";

export interface CateringMenuResponse {

    serviceId: string;

    vendorId: string;

    items: CateringMenuItem[];

}


export interface CateringMenuItemRequest {

    id?: string;

    dishId?: string;

    customName?: string;

    cuisine?: string;

    category?: string;

    foodType?: string;

    pricePerPerson: number;

    active: boolean;

}


export interface CateringMenuRequest {

    items: CateringMenuItemRequest[];

}


class VendorCateringMenuService {


    /*
     * =====================================
     * GET VENDOR MENU
     * =====================================
     */

    async getMenu(
        serviceId: string
    ): Promise<CateringMenuResponse> {

        const response =
            await api.get<CateringMenuResponse>(
                `/vendor/services/${serviceId}/catering-menu`
            );

        return response.data;

    }


    /*
     * =====================================
     * UPDATE VENDOR MENU
     * =====================================
     */

    async updateMenu(
        serviceId: string,
        request: CateringMenuRequest
    ): Promise<CateringMenuResponse> {

        const response =
            await api.put<CateringMenuResponse>(
                `/vendor/services/${serviceId}/catering-menu`,
                request
            );

        return response.data;

    }

    /*
     * =====================================
     * GET CATERING MENU OPTIONS
     * =====================================
     *
     * Returns:
     *
     * - Global master dishes
     * - This vendor's custom dishes
     *
     * filtered by cuisine and optionally
     * food type.
     */

    async getMenuOptions(
        serviceId: string,
        cuisine: string,
        foodType?: string
    ): Promise<CateringMenuOption[]> {

        const params: Record<string, string> = {
            cuisine
        };


        if (
            foodType &&
            foodType.trim()
        ) {

            params.foodType =
                foodType;

        }


        const response =
            await api.get<CateringMenuOption[]>(
                `/vendor/services/${serviceId}/catering-menu/options`,
                {
                    params
                }
            );


        return response.data;

    }

}


export default new VendorCateringMenuService();