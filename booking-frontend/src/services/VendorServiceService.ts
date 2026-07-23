import api from "../api/axiosConfig";
import type { VendorService } from "../types/VendorService";
import type { CreateVendorServiceRequest } from "../types/CreateVendorServiceRequest";

class VendorServiceService {

    async getServices(): Promise<VendorService[]> {

        const response =
            await api.get<VendorService[]>("/vendor/services");

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
        request: CreateVendorServiceRequest
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

        request: CreateVendorServiceRequest

    ): Promise<VendorService> {

        const response = await api.put<VendorService>(

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

}

export default new VendorServiceService();