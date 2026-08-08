import api from "../api/axiosConfig";
import type { AdminUser } from "../types/AdminUser";

class AdminUserService {

    async getUsers(): Promise<AdminUser[]> {

        const response =
            await api.get<AdminUser[]>(
                "/admin/users"
            );

        return response.data;
    }

    async getUser(
        userId: string
    ): Promise<AdminUser> {

        const response =
            await api.get<AdminUser>(
                `/admin/users/${userId}`
            );

        return response.data;
    }

}

export default new AdminUserService();