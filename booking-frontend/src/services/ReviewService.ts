import api from "../api/axiosConfig";
import type { Review } from "../types/Review";

export interface CreateReviewRequest {
    bookingId: string;
    rating: number;
    comment: string;
}

class ReviewService {

    /*
     * =========================================
     * VENDOR REVIEWS
     * =========================================
     */

    async getReviews(): Promise<Review[]> {

        const response =
            await api.get<Review[]>(
                "/reviews/vendor"
            );

        return response.data;
    }


    /*
     * =========================================
     * CUSTOMER - CREATE REVIEW
     * =========================================
     */

    async createReview(
        request: CreateReviewRequest
    ): Promise<Review> {

        const response =
            await api.post<Review>(
                "/reviews",
                request
            );

        return response.data;
    }


    /*
     * =========================================
     * CUSTOMER - MY REVIEWS
     * =========================================
     */

    async getCustomerReviews(): Promise<Review[]> {

        const response =
            await api.get<Review[]>(
                "/reviews/customer"
            );

        return response.data;
    }

}

export default new ReviewService();