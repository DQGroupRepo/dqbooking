import api from "../api/axiosConfig";

import type {
    VendorNotification
} from "../types/VendorNotification";

class VendorNotificationService {

    async getNotifications(): Promise<VendorNotification[]> {

        const response =
            await api.get<VendorNotification[]>(
                "/vendor/notifications"
            );

        return response.data;

    }

}

export default new VendorNotificationService();