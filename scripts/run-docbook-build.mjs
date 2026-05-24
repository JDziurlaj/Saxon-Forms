#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const defaultBuildFile = path.join(repoRoot, "docs", "docbook", "build.xml");
const defaultAnt4DocbookHome = path.join(repoRoot, "ant4docbook-0.10.0");

const TARGET_BY_FORMAT = {
  all: "docbook-all",
  html: "docbook-html",
  pdf: "docbook-pdf",
  validate: "docbook-validate"
};

function parseArgs(argv) {
  const config = {
    format: "all",
    antBin: process.env.ANT_BIN || "ant",
    buildFile: defaultBuildFile,
    ant4docbookHome: defaultAnt4DocbookHome
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      config.help = true;
      continue;
    }
    if (arg.startsWith("--format=")) {
      config.format = arg.slice("--format=".length).trim().toLowerCase();
      continue;
    }
    if (arg.startsWith("--ant-bin=")) {
      config.antBin = arg.slice("--ant-bin=".length).trim();
      continue;
    }
    if (arg.startsWith("--build-file=")) {
      config.buildFile = path.resolve(repoRoot, arg.slice("--build-file=".length).trim());
      continue;
    }
    if (arg.startsWith("--ant4docbook-home=")) {
      config.ant4docbookHome = path.resolve(repoRoot, arg.slice("--ant4docbook-home=".length).trim());
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  if (!TARGET_BY_FORMAT[config.format]) {
    throw new Error(
      `Invalid --format value "${config.format}". Expected one of: ${Object.keys(TARGET_BY_FORMAT).join(", ")}.`
    );
  }

  return config;
}

async function commandExists(commandName) {
  if (!commandName) return false;
  if (commandName.includes("/") || commandName.includes("\\")) {
    try {
      await fs.access(path.resolve(commandName));
      return true;
    } catch {
      return false;
    }
  }
  const isWindows = process.platform === "win32";
  const lookupCommand = isWindows ? "where" : "which";
  const lookupArgs = [commandName];
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(lookupCommand, lookupArgs, {
        cwd: repoRoot,
        stdio: "ignore"
      });
      child.on("error", reject);
      child.on("exit", (code) => {
        if ((code ?? 1) === 0) resolve();
        else reject(new Error(`${commandName} not found`));
      });
    });
    return true;
  } catch {
    return false;
  }
}

function printHelp() {
  console.log(
    [
      "Usage: node scripts/run-docbook-build.mjs [options]",
      "",
      "Options:",
      "  --format=<all|html|pdf|validate>   Build target to run (default: all)",
      "  --ant-bin=<path|command>           Ant executable (default: ANT_BIN env or 'ant')",
      "  --build-file=<path>                Ant build file path (default: docs/docbook/build.xml)",
      "  --ant4docbook-home=<path>          ant4docbook distribution directory",
      "  --help, -h                         Show this help"
    ].join("\n")
  );
}

async function runAnt(config) {
  const target = TARGET_BY_FORMAT[config.format];
  const antArgs = [
    "-f",
    config.buildFile,
    `-Dant4docbook.home=${config.ant4docbookHome}`,
    target
  ];

  console.log(
    JSON.stringify({
      event: "docbook-build-start",
      ts: new Date().toISOString(),
      ant_bin: config.antBin,
      build_file: config.buildFile,
      ant4docbook_home: config.ant4docbookHome,
      target
    })
  );

  const isWindows = process.platform === "win32";
  const command = isWindows ? "cmd.exe" : config.antBin;
  const args = isWindows ? ["/d", "/s", "/c", config.antBin, ...antArgs] : antArgs;

  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Ant process terminated with signal ${signal}`));
        return;
      }
      if ((code ?? 1) !== 0) {
        reject(new Error(`Ant process failed with exit code ${code}`));
        return;
      }
      resolve();
    });
  });

  console.log(
    JSON.stringify({
      event: "docbook-build-complete",
      ts: new Date().toISOString(),
      target
    })
  );
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  if (config.help) {
    printHelp();
    return;
  }
  const antExists = await commandExists(config.antBin);
  if (!antExists) {
    throw new Error(
      `Ant executable not found: ${config.antBin}. Install Apache Ant and ensure it is on PATH, or pass --ant-bin=<path>.`
    );
  }
  await runAnt(config);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
