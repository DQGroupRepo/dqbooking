import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

import api from "../api/axios";
import CartService from "../services/CartService";
import { clearAuthSession, getAuthToken, getStoredAuthUser, storeAuthSession, updateStoredAuthUser } from "../util/authStorage";

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
        user: AuthUser,
        rememberMe?: boolean
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
        const currentToken = getAuthToken();

        // Run remote cleanup while the current JWT is still available. Both
        // operations are best-effort; local logout must never be blocked.
        if (currentToken) {
            void api.post("/auth/logout", {}, {
                headers: { Authorization: `Bearer ${currentToken}` }
            }).catch((error) => {
                console.warn("Server-side logout could not be completed.", error);
            });
        }
        void CartService.clearCart(currentToken).catch((error) => {
            console.warn("Cart cleanup could not be completed.", error);
        });

        clearAuthSession();
        delete api.defaults.headers.common["Authorization"];
        setToken(null);
        setUser(null);
        window.dispatchEvent(new Event("eventnest-logged-out"));
    };


    /*
     * =========================================
     * LOGIN
     * =========================================
     */

    const login = (
        newToken: string,
        newUser: AuthUser,
        rememberMe = false
    ) => {

        /*
         * Store authentication details.
         */

        storeAuthSession(newToken, newUser, rememberMe);


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

            const storedToken = getAuthToken();
            const storedUser = getStoredAuthUser();


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

                        clearAuthSession();

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

                updateStoredAuthUser(validatedUser);


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

                clearAuthSession();


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
                event.key === "eventnest_token" &&
                event.newValue === null &&
                !getAuthToken()
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