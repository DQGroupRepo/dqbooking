import api from "../api/axiosConfig";
import type { VendorDashboard } from "../types/VendorDashboard";

class VendorDashboardService {

    async getDashboard(): Promise<VendorDashboard> {
        const response = await api.get<VendorDashboard>(
            "/vendor/dashboard"
        );

        return response.data;
    }

}

export default new VendorDashboardService();
