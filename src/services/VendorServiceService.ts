import { mockVendorServices } from "../mocks/mockVendorServices";

import type { VendorService } from "../types/VendorService";

class VendorServiceService {

    async getServices(): Promise<VendorService[]> {

        return Promise.resolve(mockVendorServices);

    }

    async getServiceById(
        id: number
    ): Promise<VendorService | undefined> {

        return Promise.resolve(

            mockVendorServices.find(
                service => service.id === id
            )

        );

    }

}

export default new VendorServiceService();