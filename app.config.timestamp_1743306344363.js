// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  tsr: {
    appDirectory: "src"
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      })
    ]
  },
  server: {
    experimental: {
      websocket: true
    }
  }
}).then(
  (config) => config.addRouter({
    name: "websocket",
    type: "http",
    handler: "./src/ws.ts",
    target: "server",
    base: "/ws"
  })
);
export {
  app_config_default as default
};
