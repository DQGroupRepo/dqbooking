import api from "../api/axiosConfig";
import type {
  ServiceAttributeSuggestion,
  ServiceAttributeType
} from "../types/ServiceAttributeSuggestion";

class ServiceAttributeDirectoryService {
  async getSuggestions(
    category: string,
    type: ServiceAttributeType
  ): Promise<ServiceAttributeSuggestion[]> {
    const response = await api.get<ServiceAttributeSuggestion[]>(
      "/service-attribute-directory",
      { params: { category: category.toUpperCase(), type } }
    );
    return response.data ?? [];
  }

  async addCustom(
    category: string,
    type: ServiceAttributeType,
    name: string
  ): Promise<ServiceAttributeSuggestion> {
    const response = await api.post<ServiceAttributeSuggestion>(
      "/service-attribute-directory",
      { category: category.toUpperCase(), type, name }
    );
    return response.data;
  }
}

export default new ServiceAttributeDirectoryService();
