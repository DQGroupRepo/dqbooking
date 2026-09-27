import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

import api from "../api/axios";

export type UserRole =
    | "CUSTOMER"
    | "VENDOR_ADMIN"
    | "VENDOR_USER"
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

    authLoading: boolean;

    login: (
        token: string,
        user: AuthUser
    ) => void;

    logout: () => void;

}


const AuthContext =
    createContext<
        AuthContextType | undefined
    >(undefined);


interface AuthProviderProps {

    children: ReactNode;

}


export const AuthProvider = ({
    children
}: AuthProviderProps) => {


    const [
        user,
        setUser
    ] =
        useState<AuthUser | null>(null);


    const [
        token,
        setToken
    ] =
        useState<string | null>(null);


    const [
        authLoading,
        setAuthLoading
    ] =
        useState(true);


    /*
     * =========================================
     * LOGOUT
     * =========================================
     */

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


    /*
     * =========================================
     * LOGIN
     * =========================================
     */

    const login = (
        newToken: string,
        newUser: AuthUser
    ) => {

        /*
         * Store authentication details.
         */

        localStorage.setItem(
            "eventnest_token",
            newToken
        );


        localStorage.setItem(
            "eventnest_user",
            JSON.stringify(
                newUser
            )
        );


        /*
         * Update Axios immediately.
         */

        api.defaults.headers.common[
            "Authorization"
        ] =
            `Bearer ${newToken}`;


        /*
         * Update React state.
         */

        setToken(
            newToken
        );

        setUser(
            newUser
        );

    };


    /*
     * =========================================
     * INITIAL AUTHENTICATION CHECK
     * =========================================
     */

    useEffect(() => {

        let mounted = true;


        async function initializeAuth() {


            /*
             * =====================================
             * RESTORE TOKEN
             * =====================================
             */

            const storedToken =
                localStorage.getItem(
                    "eventnest_token"
                );


            const storedUser =
                localStorage.getItem(
                    "eventnest_user"
                );


            /*
             * No token means user is logged out.
             */

            if (!storedToken) {

                if (mounted) {

                    setToken(null);

                    setUser(null);

                    setAuthLoading(false);

                }

                return;

            }


            /*
             * =====================================
             * RESTORE AXIOS AUTHORIZATION HEADER
             * =====================================
             *
             * This is important after a browser
             * refresh because React state is reset.
             */

            api.defaults.headers.common[
                "Authorization"
            ] =
                `Bearer ${storedToken}`;


            /*
             * =====================================
             * RESTORE REACT STATE
             * =====================================
             */

            if (mounted) {

                setToken(
                    storedToken
                );


                /*
                 * Restore the locally stored user
                 * immediately if available.
                 */

                if (storedUser) {

                    try {

                        const parsedUser =
                            JSON.parse(
                                storedUser
                            ) as AuthUser;


                        setUser(
                            parsedUser
                        );

                    }
                    catch (error) {

                        console.error(
                            "Failed to parse stored user:",
                            error
                        );

                        localStorage.removeItem(
                            "eventnest_user"
                        );

                    }

                }

            }


            try {

                /*
                 * =====================================
                 * VALIDATE JWT WITH BACKEND
                 * =====================================
                 */

                const response =
                    await api.get<AuthUser>(
                        "/auth/me",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${storedToken}`
                            }
                        }
                    );


                if (!mounted) {

                    return;

                }


                const validatedUser =
                    response.data;


                /*
                 * Keep local storage synchronized.
                 */

                localStorage.setItem(
                    "eventnest_user",
                    JSON.stringify(
                        validatedUser
                    )
                );


                setUser(
                    validatedUser
                );

            }
            catch (error) {

                console.error(
                    "Authentication validation failed:",
                    error
                );


                /*
                 * JWT is invalid or expired.
                 */

                localStorage.removeItem(
                    "eventnest_token"
                );


                localStorage.removeItem(
                    "eventnest_user"
                );


                delete api.defaults.headers.common[
                    "Authorization"
                ];


                if (mounted) {

                    setToken(null);

                    setUser(null);

                }

            }
            finally {

                if (mounted) {

                    setAuthLoading(
                        false
                    );

                }

            }

        }


        initializeAuth();


        return () => {

            mounted = false;

        };

    }, []);


    /*
     * =========================================
     * LISTEN FOR GLOBAL AUTH EXPIRATION
     * =========================================
     */

    useEffect(() => {

        const handleAuthExpired = () => {

            logout();

        };


        window.addEventListener(
            "eventnest-auth-expired",
            handleAuthExpired
        );


        return () => {

            window.removeEventListener(
                "eventnest-auth-expired",
                handleAuthExpired
            );

        };

    }, []);


    /*
     * =========================================
     * CROSS-TAB LOGOUT
     * =========================================
     */

    useEffect(() => {

        const handleStorageChange = (
            event: StorageEvent
        ) => {

            if (
                event.key ===
                    "eventnest_token" &&
                event.newValue === null
            ) {

                delete api.defaults.headers.common[
                    "Authorization"
                ];


                setToken(null);

                setUser(null);

            }

        };


        window.addEventListener(
            "storage",
            handleStorageChange
        );


        return () => {

            window.removeEventListener(
                "storage",
                handleStorageChange
            );

        };

    }, []);


    const value: AuthContextType = {

        user,

        token,

        isAuthenticated:
            !!token && !!user,

        authLoading,

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
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;

};