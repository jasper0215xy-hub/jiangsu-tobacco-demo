import { cpSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

execFileSync("npm", ["run", "build", "-w", "@demo/web"], { stdio: "inherit" });
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/server", { recursive: true });
cpSync("apps/web/dist", "dist", { recursive: true });
cpSync("hosting/worker.js", "dist/server/index.js");
console.log("托管站点构建完成");
