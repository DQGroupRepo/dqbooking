import api from "../api/axiosConfig";
import type { VendorProfile } from "../types/VendorProfile";

class VendorProfileService {

    async getProfile(): Promise<VendorProfile> {

        const response = await api.get<VendorProfile>(
            "/vendor/profile"
        );

        return response.data;

    }

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await api.post("/auth/change-password", { currentPassword, newPassword });
    }

    async requestPasswordOtp(email: string): Promise<string> {
        const response = await api.post("/auth/forgot-password/request-otp", { email });
        return response.data.message;
    }

    async verifyPasswordOtp(email: string, otp: string): Promise<void> {
        await api.post("/auth/forgot-password/verify-otp", { email, otp });
    }

    async resetPassword(email: string, otp: string, newPassword: string): Promise<string> {
        const response = await api.post("/auth/forgot-password/reset", { email, otp, newPassword });
        return response.data.message;
    }

    async submitSettingsChanges(changes: Record<string, string>): Promise<void> {
        await api.post("/vendor/settings-approval/submit", { changes });
    }

    async getMySettingsRequests(): Promise<any[]> {
        const response = await api.get<any[]>("/vendor/settings-approval/mine");
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