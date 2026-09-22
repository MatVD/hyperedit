import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { mochaPlugins } from "@getmocha/vite-plugins";

export default defineConfig(({ command, isPreview }) => {
  let localApiToken = "";

  if (command === "serve" && !isPreview) {
    const securityPath = path.resolve(__dirname, ".hyperedit-security.json");
    const security = JSON.parse(fs.readFileSync(securityPath, "utf-8")) as { localApiToken?: string };
    localApiToken = String(security.localApiToken || "").trim();

    if (!localApiToken) {
      throw new Error("Missing localApiToken in .hyperedit-security.json");
    }
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [...mochaPlugins(process.env as any), react(), cloudflare()],
    define: {
      "import.meta.env.VITE_HYPEREDIT_LOCAL_TOKEN": JSON.stringify(localApiToken),
    },
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      allowedHosts: ["localhost", "127.0.0.1"],
    },
    build: {
      chunkSizeWarningLimit: 5000,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
