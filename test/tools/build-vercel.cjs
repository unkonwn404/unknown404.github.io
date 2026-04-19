const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectDir = process.cwd();
const runtimeConfigPath = path.join(
  os.tmpdir(),
  `hexo-vercel-${Date.now()}.yml`
);
const detectedHost =
  process.env.SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL;
const siteUrl = detectedHost
  ? detectedHost.startsWith("http")
    ? detectedHost
    : `https://${detectedHost}`
  : "https://example.vercel.app";

fs.writeFileSync(runtimeConfigPath, `url: ${siteUrl}\n`, "utf8");

const commands = [
  ["npx", ["hexo", "clean"]],
  [
    "npx",
    [
      "hexo",
      "generate",
      "--config",
      `_config.yml,_config.vercel.yml,${runtimeConfigPath}`
    ]
  ]
];

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    cwd: projectDir,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    fs.rmSync(runtimeConfigPath, { force: true });
    process.exit(result.status || 1);
  }
}

fs.rmSync(runtimeConfigPath, { force: true });
