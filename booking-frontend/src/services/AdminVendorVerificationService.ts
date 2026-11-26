import api from "../api/axiosConfig";

import type {
    AdminVendorVerification
} from "../types/AdminVendorVerification";


export type DiscoveryTag =
    | "FEATURED"
    | "TRENDING_NOW"
    | "MOST_BOOKED"
    | "POPULAR_HALL"
    | "TOP_BRIDAL_MAKEUP"
    | "PROFESSIONAL_PHOTOGRAPHY"
    | "WEDDING_VIDEOGRAPHY";


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


    async getPendingSettings(vendorId: string): Promise<any[]> {
        const response = await api.get<any[]>(`/admin/vendors/${vendorId}/settings-approval`);
        return response.data;
    }

    async decideSettings(vendorId: string, itemKeys: string[], action: "APPROVE" | "REJECT", reason?: string): Promise<void> {
        await api.post(`/admin/vendors/${vendorId}/settings-approval/decision`, { itemKeys, action, reason });
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

        /*
         * =========================================
         * VENDOR SUPPORT MODE
         * =========================================
         */

        async startVendorSupport(
            vendorId: string
        ): Promise<void> {

            await api.post(
                `/admin/vendor-support/${vendorId}/start`
            );

        }


        async getCurrentVendorSupport(): Promise<{
            adminId: string;
            vendorId: string;
            startedAt: string;
        } | null> {

            const response =
                await api.get<{
                    adminId: string;
                    vendorId: string;
                    startedAt: string;
                } | null>(
                    "/admin/vendor-support/current"
                );

            return response.data;

        }


        async endVendorSupport(): Promise<void> {

            await api.post(
                "/admin/vendor-support/end"
            );

        }


    /*
     * =========================================
     * SERVICE MODERATION
     * =========================================
     */

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


    /*
     * =========================================
     * DISCOVERY TAGS
     * =========================================
     */

    async updateServiceDiscoveryTags(
        serviceId: string,
        tags: DiscoveryTag[]
    ): Promise<void> {

        await api.put(
            `/admin/vendors/services/${serviceId}/discovery-tags`,
            tags
        );

    }

}


export default new AdminVendorVerificationService();