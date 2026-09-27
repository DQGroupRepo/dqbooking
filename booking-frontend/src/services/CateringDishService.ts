import type { CateringDish } from "../types/CateringDish";
import api from "../api/axiosConfig";

class CateringDishService {

    async getAllDishes() {

        const response =
            await api.get<CateringDish[]>(
                "/catering-dishes"
            );

        return response.data;
    }


    async getByCuisine(
        cuisine: string,
        foodType?: string
    ) {

        const response =
            await api.get<CateringDish[]>(
                "/catering-dishes",
                {
                    params: {
                        cuisine,
                        ...(foodType
                            ? {
                                foodType
                            }
                            : {})
                    }
                }
            );

        return response.data;
    }


    async getByCuisineAndCategory(
        cuisine: string,
        category: string,
        foodType?: string
    ) {

        const response =
            await api.get<CateringDish[]>(
                "/catering-dishes",
                {
                    params: {
                        cuisine,
                        category,
                        ...(foodType
                            ? {
                                foodType
                            }
                            : {})
                    }
                }
            );

        return response.data;
    }


    async getByCuisineCategoryAndFoodType(
        cuisine: string,
        category: string,
        foodType: string
    ) {

        const response =
            await api.get<CateringDish[]>(
                "/catering-dishes",
                {
                    params: {
                        cuisine,
                        category,
                        foodType
                    }
                }
            );

        return response.data;
    }

}


export default new CateringDishService();