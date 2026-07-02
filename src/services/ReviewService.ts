import { mockReviews } from "../mocks/mockReviews";

class ReviewService{

    async getReviews(){

        return Promise.resolve(

            mockReviews

        );

    }

}

export default new ReviewService();