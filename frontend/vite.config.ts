import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@shared": path.resolve(__dirname, "../shared/dist"),
		},
	},
	server: {
		port: 5173,
		host: true,
		proxy: {
			"/api": {
				target: process.env.VITE_API_TARGET ?? "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
});
