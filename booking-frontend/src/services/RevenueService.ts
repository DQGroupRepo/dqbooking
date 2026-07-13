import {

    mockRevenueSummary,
    mockMonthlyRevenue,
    mockPaymentHistory

} from "../mocks/mockRevenue";

class RevenueService {

    async getRevenueSummary() {

        return Promise.resolve(

            mockRevenueSummary

        );

    }

    async getMonthlyRevenue() {

        return Promise.resolve(

            mockMonthlyRevenue

        );

    }

    async getPaymentHistory() {

        return Promise.resolve(

            mockPaymentHistory

        );

    }

}

export default new RevenueService();