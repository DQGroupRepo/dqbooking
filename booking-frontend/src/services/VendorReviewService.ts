import api from "../api/axiosConfig";
import type { Review } from "../types/Review";

class VendorReviewService {
  async getReviews(serviceId = "") {
    const response = await api.get<Review[]>(
      `/vendor/services/${serviceId}/reviews`,
    );

    return response.data;
  }
}

export default new VendorReviewService();
