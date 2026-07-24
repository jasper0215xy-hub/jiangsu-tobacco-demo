import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { relative } from "node:path";

function staticFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? staticFiles(file) : [file];
  });
}

execFileSync("npm", ["run", "build", "-w", "@demo/web"], { stdio: "inherit" });
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/server", { recursive: true });
cpSync("apps/web/dist", "dist", { recursive: true });
// Sites maps worker assets from dist/public. Keep a root copy too so the
// packaged build stays compatible with standard Vite static output.
cpSync("apps/web/dist", "dist/public", { recursive: true });
const staticAssets = Object.fromEntries(
  staticFiles("apps/web/dist").map((file) => [
    `/${relative("apps/web/dist", file)}`,
    readFileSync(file, "utf8"),
  ]),
);
const worker = readFileSync("hosting/worker.js", "utf8").replace(
  "__STATIC_ASSETS__",
  () => JSON.stringify(staticAssets),
);
writeFileSync("dist/server/index.js", worker);
console.log("托管站点构建完成");
