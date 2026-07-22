const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const reactNodeOptions = [process.env.NODE_OPTIONS, "--no-deprecation"]
  .filter(Boolean)
  .join(" ");
const apps = [
  {
    name: "backend",
    dir: path.join(rootDir, "backend"),
    command: "npm",
    args: ["start"],
    env: { PORT: "3002" },
    url: "http://localhost:3002",
  },
  {
    name: "frontend",
    dir: path.join(rootDir, "frontend"),
    command: "npm",
    args: ["start"],
    env: { PORT: "3000", BROWSER: "none", NODE_OPTIONS: reactNodeOptions },
    url: "http://localhost:3000",
  },
  {
    name: "dashboard",
    dir: path.join(rootDir, "dashboard"),
    command: "npm",
    args: ["start"],
    env: { PORT: "3001", BROWSER: "none", NODE_OPTIONS: reactNodeOptions },
    url: "http://localhost:3001",
  },
];

const children = [];

const installDependencies = (app) => {
  const nodeModulesPath = path.join(app.dir, "node_modules");

  if (fs.existsSync(nodeModulesPath)) {
    return;
  }

  console.log(`[${app.name}] Installing dependencies...`);
  const result = spawnSync("npm", ["install"], {
    cwd: app.dir,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Dependency install failed for ${app.name}`);
  }
};

const startApp = (app) => {
  installDependencies(app);

  const child = spawn(app.command, app.args, {
    cwd: app.dir,
    env: { ...process.env, ...app.env },
    stdio: "inherit",
  });

  children.push(child);
  console.log(`[${app.name}] Starting on ${app.url}`);

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[${app.name}] exited with code ${code}`);
    }
  });
};

const stopAll = () => {
  for (const child of children) {
    child.kill("SIGTERM");
  }
};

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stopAll();
  process.exit(0);
});

for (const app of apps) {
  startApp(app);
}

console.log("");
console.log("Apps are starting:");
console.log("Frontend:  http://localhost:3000");
console.log("Dashboard: http://localhost:3001");
console.log("Backend:   http://localhost:3002");
