import api from "../api/axiosConfig";
import type { ServiceSettings } from "../types/ServiceSettings";

class ServiceSettingsService {

    async getSettings(
        serviceId: string
    ): Promise<ServiceSettings> {

        const response =
            await api.get<ServiceSettings>(
                `/vendor/services/${serviceId}/settings`
            );

        return response.data;

    }

    async updateSettings(
        serviceId: string,
        settings: ServiceSettings
    ): Promise<ServiceSettings> {

        const response =
            await api.put<ServiceSettings>(
                `/vendor/services/${serviceId}/settings`,
                settings
            );

        return response.data;

    }

}

export default new ServiceSettingsService();