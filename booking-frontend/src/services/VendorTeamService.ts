import api from "../api/axios";


export type VendorPage =
    | "DASHBOARD"
    | "SERVICES"
    | "BOOKINGS"
    | "REVIEWS"
    | "REVENUE"
    | "BUNDLES"
    | "PROFILE"
    | "SETTINGS";


export interface VendorTeamMember {

    id: string;

    fullName: string;

    email: string;

    phone?: string;

    role: "VENDOR_ADMIN" | "VENDOR_USER";

    vendorId: string;

    active: boolean;

    viewPages: VendorPage[];

    editPages: VendorPage[];
}


export interface VendorTeamMemberRequest {

    firstName: string;

    lastName: string;

    email: string;

    phone: string;

    password?: string;

    viewPages: VendorPage[];

    editPages: VendorPage[];
}


const VendorTeamService = {

    async getTeamMembers(): Promise<VendorTeamMember[]> {

        const response =
            await api.get<VendorTeamMember[]>(
                "/vendor/team"
            );

        return response.data;
    },


    async getTeamMember(
        userId: string
    ): Promise<VendorTeamMember> {

        const response =
            await api.get<VendorTeamMember>(
                `/vendor/team/${userId}`
            );

        return response.data;
    },


    async createVendorUser(
        request: VendorTeamMemberRequest
    ): Promise<VendorTeamMember> {

        const response =
            await api.post<VendorTeamMember>(
                "/vendor/team",
                request
            );

        return response.data;
    },


    async updateVendorUser(
        userId: string,
        request: VendorTeamMemberRequest
    ): Promise<VendorTeamMember> {

        const response =
            await api.put<VendorTeamMember>(
                `/vendor/team/${userId}`,
                request
            );

        return response.data;
    },


    async updateStatus(
        userId: string,
        active: boolean
    ): Promise<VendorTeamMember> {

        const response =
            await api.patch<VendorTeamMember>(
                `/vendor/team/${userId}/status`,
                null,
                {
                    params: {
                        active
                    }
                }
            );

        return response.data;
    },


    async deleteVendorUser(
        userId: string
    ): Promise<void> {

        await api.delete(
            `/vendor/team/${userId}`
        );
    },


    async updatePermissions(
        userId: string,
        viewPages: VendorPage[],
        editPages: VendorPage[]
    ): Promise<void> {

        await api.put(
            `/vendor/team/${userId}/permissions`,
            {
                viewPages,
                editPages
            }
        );
    }

};


export default VendorTeamService;