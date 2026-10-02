import axios from "axios";


const api = axios.create({

    baseURL: "https://dqbooking-z0gb.onrender.com/api",

    headers: {

        "Content-Type":
            "application/json",

    },

});


/*
 * =========================================
 * ATTACH JWT
 * =========================================
 */

api.interceptors.request.use(

    config => {

        const token =
            localStorage.getItem(
                "eventnest_token"
            );


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    }

);


/*
 * =========================================
 * HANDLE AUTHENTICATION EXPIRATION
 * =========================================
 */

api.interceptors.response.use(

    response => {

        return response;

    },

    error => {

        const status =
            error.response?.status;


        /*
         * 401 means the authentication
         * is no longer valid.
         */

        if (status === 401) {

            const currentToken =
                localStorage.getItem(
                    "eventnest_token"
                );


            /*
             * Only trigger logout when
             * there is actually a token.
             */

            if (currentToken) {

                window.dispatchEvent(
                    new Event(
                        "eventnest-auth-expired"
                    )
                );

            }

        }


        return Promise.reject(
            error
        );

    }

);


export default api;