import { cpSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

execFileSync("npm", ["run", "build", "-w", "@demo/web"], { stdio: "inherit" });
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/server", { recursive: true });
cpSync("apps/web/dist", "dist", { recursive: true });
// Sites maps worker assets from dist/public. Keep a root copy too so the
// packaged build stays compatible with standard Vite static output.
cpSync("apps/web/dist", "dist/public", { recursive: true });
cpSync("hosting/worker.js", "dist/server/index.js");
console.log("托管站点构建完成");
