import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",

  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * =========================================
 * REQUEST INTERCEPTOR
 * =========================================
 *
 * Attach the stored JWT to every API request.
 */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("eventnest_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/*
 * =========================================
 * RESPONSE INTERCEPTOR
 * =========================================
 *
 * Handle expired or invalid authentication.
 */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    /*
     * Do not automatically redirect from
     * the login endpoint itself.
     */

    const requestUrl = error.config?.url ?? "";

    if (error.response?.status === 401 && !requestUrl.includes("/auth/login")) {
      /*
       * Remove only authentication data.
       *
       * Avoid localStorage.clear() because
       * other application data may exist.
       */

      localStorage.removeItem("eventnest_token");

      localStorage.removeItem("eventnest_user");

      /*
       * Notify AuthContext.
       */

      window.dispatchEvent(new Event("eventnest-auth-expired"));
    }

    return Promise.reject(error);
  },
);

export default api;
