import api from "../api/axiosConfig";

import type {
    AdminVendorVerification
} from "../types/AdminVendorVerification";

class AdminVendorVerificationService {

    async getVendors(): Promise<AdminVendorVerification[]> {

        const response =
            await api.get<AdminVendorVerification[]>(
                "/admin/vendors"
            );

        return response.data;
    }

    async getVendor(
        vendorId: string
    ): Promise<AdminVendorVerification> {

        const response =
            await api.get<AdminVendorVerification>(
                `/admin/vendors/${vendorId}`
            );

        return response.data;
    }

    async approveVendor(
        vendorId: string
    ): Promise<void> {

        await api.put(
            `/admin/vendors/${vendorId}/approve`
        );
    }

    async rejectVendor(
        vendorId: string
    ): Promise<void> {

        await api.put(
            `/admin/vendors/${vendorId}/reject`
        );
    }

    async suspendVendor(
        vendorId: string
    ): Promise<void> {

        await api.put(
            `/admin/vendors/${vendorId}/suspend`
        );
    }

    async reactivateVendor(
        vendorId: string
    ): Promise<void> {

        await api.put(
            `/admin/vendors/${vendorId}/reactivate`
        );
    }

    async approveService(
        serviceId: string
    ): Promise<void> {

        await api.put(
            `/admin/services/${serviceId}/approve`
        );
    }

    async rejectService(
        serviceId: string
    ): Promise<void> {

        await api.put(
            `/admin/services/${serviceId}/reject`
        );
    }

    async suspendService(
        serviceId: string
    ): Promise<void> {

        await api.put(
            `/admin/services/${serviceId}/suspend`
        );
    }

    async reactivateService(
        serviceId: string
    ): Promise<void> {

        await api.put(
            `/admin/services/${serviceId}/reactivate`
        );
    }
}

export default new AdminVendorVerificationService();