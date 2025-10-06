import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode, command }) => {
  const plugins = [react()];
  if (command === "serve") {
    // Only require and use the express plugin in dev
    const { createServer } = require("./server");
    plugins.push(expressPlugin(createServer));
  }

  return {
    root: "./client",
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      outDir: "dist/spa",
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  };
});

// Express plugin definition
function expressPlugin(createServer) {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer(server) {
      const app = createServer();
      server.middlewares.use(app);
    },
  };
}
