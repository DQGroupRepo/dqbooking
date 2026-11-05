import api from "../api/axiosConfig";
import type {
    CreateVendorEnquiryRequest,
    VendorEnquiry
} from "../types/VendorEnquiry";

class VendorEnquiryService {
    async getByEventDate(eventDate: string): Promise<VendorEnquiry[]> {
        const response = await api.get<VendorEnquiry[]>("/vendor/enquiries", {
            params: { eventDate }
        });
        return response.data;
    }

    async create(
        request: CreateVendorEnquiryRequest
    ): Promise<VendorEnquiry> {
        const response = await api.post<VendorEnquiry>(
            "/vendor/enquiries",
            request
        );
        return response.data;
    }
}

export default new VendorEnquiryService();
