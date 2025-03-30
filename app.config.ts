import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
  server: {
    experimental: {
      websocket: true,
    },
  },
}).then((config) =>
  config.addRouter({
    name: "websocket",
    type: "http",
    handler: "./src/ws.ts",
    target: "server",
    base: "/ws",
  })
);
