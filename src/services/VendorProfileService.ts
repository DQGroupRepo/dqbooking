import { mockVendorProfile } from "../mocks/mockVendorProfile";

import type { VendorProfile } from "../types/VendorProfile";

class VendorProfileService{

    private profile={

        ...mockVendorProfile

    };

    async getProfile():Promise<VendorProfile>{

        return Promise.resolve(

            this.profile

        );

    }

    async updateProfile(

        profile:VendorProfile

    ){

        this.profile={

            ...profile

        };

        return Promise.resolve(true);

    }

}

export default new VendorProfileService();