import { mockVendorReviews } from "../mocks/mockVendorReviews";

const VendorReviewService = {

    async getReviews() {

        return Promise.resolve(mockVendorReviews);

    }

};

export default VendorReviewService;