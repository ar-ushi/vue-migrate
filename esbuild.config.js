import { build } from "esbuild";

await build({
  entryPoints: ["index.js"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: ["node18"],
  outfile: "dist/index.js",
  banner: {
    js: "#!/usr/bin/env node",
  },
});
