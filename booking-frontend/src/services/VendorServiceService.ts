import api from "../api/axiosConfig";
import type { VendorService } from "../types/VendorService";
import type { VendorServiceRequest } from "../types/VendorServiceRequest";
import type { ServicePackage } from "../types/ServicePackage";

class VendorServiceService {


    async getServices(): Promise<VendorService[]> {

        const response =
            await api.get<VendorService[]>(
                "/vendor/services"
            );

        return response.data;

    }


    async getServiceById(
        id: string
    ): Promise<VendorService> {

        const response =
            await api.get<VendorService>(
                `/vendor/services/${id}`
            );

        return response.data;

    }


    async createService(
        request: VendorServiceRequest
    ): Promise<VendorService> {

        const response =
            await api.post<VendorService>(
                "/vendor/services",
                request
            );

        return response.data;

    }


    async updateService(
        id: string,
        request: VendorServiceRequest
    ): Promise<VendorService> {

        const response =
            await api.put<VendorService>(
                `/vendor/services/${id}`,
                request
            );

        return response.data;

    }


    async deleteService(
        id: string
    ): Promise<void> {

        await api.delete(
            `/vendor/services/${id}`
        );

    }


    async changeStatus(
        id: string,
        active: boolean
    ): Promise<VendorService> {

        const response =
            await api.patch<VendorService>(
                `/vendor/services/${id}/status`,
                { active }
            );

        return response.data;

    }

    async updatePackages(
        serviceId: string,
        packages: ServicePackage[]
    ): Promise<VendorService> {

        const response =
            await api.put<VendorService>(
                `/vendor/services/${serviceId}/packages`,
                packages
            );

        return response.data;
    }
}


export default new VendorServiceService();