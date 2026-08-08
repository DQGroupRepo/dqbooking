import api from "../api/axiosConfig";
import type { Review } from "../types/Review";

class AdminReviewService {

    async getReviews(): Promise<Review[]> {

        const response =
            await api.get<Review[]>(
                "/admin/reviews"
            );

        return response.data;

    }


    async deleteReview(
        reviewId: string
    ): Promise<void> {

        await api.delete(
            `/admin/reviews/${reviewId}`
        );

    }

}

export default new AdminReviewService();