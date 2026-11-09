import api from "../api/axiosConfig";
import type { VendorDashboardSummary } from "../types/VendorDashboard";

class VendorDashboardService {
  async getDashboard(): Promise<VendorDashboardSummary> {
    const response = await api.get<VendorDashboardSummary>("/vendor/dashboard");

    return response.data;
  }
}

export default new VendorDashboardService();
