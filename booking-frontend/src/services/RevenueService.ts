import api from "../api/axiosConfig";

import type {

    RevenueSummary,
    MonthlyRevenue,
    PaymentHistory

} from "../types/Revenue";

class RevenueService {

    async getRevenueSummary()
        : Promise<RevenueSummary> {

        const response =
            await api.get<RevenueSummary>(
                "/vendor/revenue/summary"
            );

        return response.data;

    }

    async getMonthlyRevenue()
        : Promise<MonthlyRevenue[]> {

        const response =
            await api.get<MonthlyRevenue[]>(
                "/vendor/revenue/monthly"
            );

        return response.data;

    }

    async getPaymentHistory()
        : Promise<PaymentHistory[]> {

        const response =
            await api.get<PaymentHistory[]>(
                "/vendor/revenue/payments"
            );

        return response.data;

    }

}

export default new RevenueService();