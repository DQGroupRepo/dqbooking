import {
    createContext,
    useContext,
    useState,
    type ReactNode
} from "react";


export type UserRole =
    | "CUSTOMER"
    | "VENDOR"
    | "ADMIN";


export interface AuthUser {

    userId: string;

    role: UserRole;

    name: string;

}


interface AuthContextType {

    user: AuthUser | null;

    token: string | null;

    isAuthenticated: boolean;

    login: (
        token: string,
        user: AuthUser
    ) => void;

    logout: () => void;

}


const AuthContext =
    createContext<AuthContextType | undefined>(
        undefined
    );


interface AuthProviderProps {

    children: ReactNode;

}


export const AuthProvider = ({
    children
}: AuthProviderProps) => {


    const [user, setUser] =
        useState<AuthUser | null>(() => {

            const storedUser =
                localStorage.getItem(
                    "eventnest_user"
                );

            if (!storedUser) {

                return null;

            }

            try {

                return JSON.parse(
                    storedUser
                );

            } catch {

                return null;

            }

        });


    const [token, setToken] =
        useState<string | null>(() => {

            return localStorage.getItem(
                "eventnest_token"
            );

        });


    const login = (
        newToken: string,
        newUser: AuthUser
    ) => {

        localStorage.setItem(
            "eventnest_token",
            newToken
        );


        localStorage.setItem(
            "eventnest_user",
            JSON.stringify(newUser)
        );


        setToken(newToken);

        setUser(newUser);

    };


    const logout = () => {

        localStorage.removeItem(
            "eventnest_token"
        );

        localStorage.removeItem(
            "eventnest_user"
        );

        setToken(null);

        setUser(null);

    };


    const value: AuthContextType = {

        user,

        token,

        isAuthenticated:
            !!token && !!user,

        login,

        logout

    };


    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>

    );

};


export const useAuth = () => {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;

};