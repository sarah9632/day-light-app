import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "Day Light",
        short_name: "Day Light",
        description: "كل يوم نقطة ضوء، لونها إنت اللي بتحددها",
        theme_color: "#14161F",
        background_color: "#14161F",
        display: "standalone",
        start_url: "/",
        lang: "ar",
        dir: "rtl",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
