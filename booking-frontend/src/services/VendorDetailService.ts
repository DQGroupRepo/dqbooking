import api from "../api/axiosConfig";

import type { VendorDetail }
    from "../types/VendorDetail";

class VendorDetailService {

    async getById(
        serviceId: string
    ): Promise<VendorDetail> {

        const response =
            await api.get<VendorDetail>(
                `/customer/services/${serviceId}`
            );

        return response.data;

    }

}

export default new VendorDetailService();