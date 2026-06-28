import { mockVendorDashboard } from "../mocks/mockVendorDashboard";

class VendorDashboardService {
  async getDashboardSummary() {
    return Promise.resolve(mockVendorDashboard);
  }
}

export default new VendorDashboardService();