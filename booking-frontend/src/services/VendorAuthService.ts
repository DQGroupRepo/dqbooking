import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";


export interface VendorRegisterRequest {

    fullName: string;

    email: string;

    phone: string;

    password: string;

    businessName: string;

    ownerName: string;

    city: string;

    address: string;

    description: string;

}


export interface VendorRegisterResponse {

    userId: string;

    vendorId: string;

    email: string;

    businessName: string;

    message: string;

}


class VendorAuthService {


    register(
        data: VendorRegisterRequest
    ) {

        return api.post<VendorRegisterResponse>(

            ENDPOINTS.VENDOR_REGISTER,

            data

        );

    }

}


export default new VendorAuthService();