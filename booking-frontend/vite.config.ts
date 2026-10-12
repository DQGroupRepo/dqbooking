
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  build: {
    cssMinify: "esbuild",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-router-dom") ||
              id.includes("react-dom") ||
              id.includes("react")
            ) return "react";

            if (id.includes("recharts")) return "charts";
            if (id.includes("react-calendar")) return "calendar";
            if (id.includes("swiper")) return "swiper";

            if (
              id.includes("react-hot-toast") ||
              id.includes("react-toastify")
            ) return "toast";

            if (id.includes("bootstrap")) return "bootstrap";
          }
        },
      },
    },
  },
});
