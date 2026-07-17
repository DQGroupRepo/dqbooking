import api from "../api/axiosConfig";
import type { VendorProfile } from "../types/VendorProfile";

class VendorProfileService {

    async getProfile(): Promise<VendorProfile> {

        const response = await api.get<VendorProfile>(
            "/vendor/profile"
        );

        return response.data;

    }

    async updateProfile(
        profile: VendorProfile
    ): Promise<VendorProfile> {

        const response = await api.put<VendorProfile>(
            "/vendor/profile",
            profile
        );

        return response.data;

    }

}

export default new VendorProfileService();