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

    async updateService(
        updatedService: VendorService
    ): Promise<VendorService> {

        const index = mockVendorServices.findIndex(

            service => service.id === updatedService.id

        );

        if (index !== -1) {

            mockVendorServices[index] = updatedService;

        }

        return Promise.resolve(updatedService);

    }

}

export default new VendorServiceService();