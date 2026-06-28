import { mockVendorCategories } from "../mocks/mockVendorCategories";
import type { VendorCategory } from "../types/VendorCategory";

class VendorCategoryService {

    async getCategories():Promise<VendorCategory[]>{

        return Promise.resolve(mockVendorCategories);

    }

}

export default new VendorCategoryService();