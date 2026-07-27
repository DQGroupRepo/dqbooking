import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./assets/styles/global.css";

import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";


ReactDOM.createRoot(
    document.getElementById("root")!
).render(

    <React.StrictMode>

        <AuthProvider>

            <App />

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: "10px",
                        background: "#333",
                        color: "#fff"
                    }
                }}
            />

        </AuthProvider>

    </React.StrictMode>

);