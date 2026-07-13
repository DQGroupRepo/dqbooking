import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";

export interface LoginRequest {

    email: string;

    password: string;

}

export interface LoginResponse {

    token: string;

    userId: string;

    role: string;

    name: string;

}

class AuthService {

    login(data: LoginRequest) {

        return api.post<LoginResponse>(

            ENDPOINTS.LOGIN,

            data

        );

    }

}

export default new AuthService();