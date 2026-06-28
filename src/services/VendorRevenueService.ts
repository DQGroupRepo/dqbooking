import { mockVendorRevenue } from "../mocks/mockVendorRevenue";

const VendorRevenueService = {

    async getRevenueSummary() {

        return Promise.resolve(mockVendorRevenue);

    }

};

export default VendorRevenueService;