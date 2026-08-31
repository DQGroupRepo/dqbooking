import api from "../api/axiosConfig";

import type { FeaturedService }
    from "../types/FeaturedService";


class CustomerServiceService {

    async getFeaturedServices():
        Promise<FeaturedService[]> {

        const response =
            await api.get<FeaturedService[]>(
                "/customer/services/featured"
            );

        return response.data;

    }

}


export default new CustomerServiceService();