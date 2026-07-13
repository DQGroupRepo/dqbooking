import { mockVendorNotifications } from "../mocks/mockVendorNotifications";

const VendorNotificationService = {

    async getNotifications() {

        return Promise.resolve(mockVendorNotifications);

    }

};

export default VendorNotificationService;