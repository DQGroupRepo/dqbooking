import api from "../api/axios";
import ENDPOINTS from "../api/endpoints";


export interface LoginRequest {

    email: string;

    password: string;

    replaceExistingSession?: boolean;

}


export interface LoginResponse {

    token: string;

    userId: string;

    role: string;

    name: string;

    requiresConfirmation?: boolean;

    message?: string;

}


export interface RegisterRequest {

    email: string;

    phone: string;

    password: string;

}


class AuthService {


    login(data: LoginRequest) {

        return api.post<LoginResponse>(

            ENDPOINTS.LOGIN,

            data

        );

    }


    register(data: RegisterRequest) {

        return api.post(

            "/auth/register",

            data

        );

    }

}


export default new AuthService();