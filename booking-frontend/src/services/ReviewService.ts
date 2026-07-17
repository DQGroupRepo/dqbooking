import api from "../api/axiosConfig";
import type { Review } from "../types/Review";

class ReviewService {

    async getReviews(): Promise<Review[]> {

        const response =
            await api.get<Review[]>(
                "/reviews/vendor"
            );

        return response.data;

    }

}

export default new ReviewService();