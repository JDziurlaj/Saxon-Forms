#!/usr/bin/env node
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const defaultBuildFile = path.join(repoRoot, "docs", "docbook", "build.xml");
const defaultAnt4DocbookHome = path.join(repoRoot, "ant4docbook-0.10.0");
const defaultAnt4DocbookCacheHome = path.join(os.homedir(), ".ant4docbook");
const DOCBOOK_XSL_VERSION = "docbook-xsl-2020-06-03";
const DOCBOOK_XSL_SNAPSHOT = "docbook-xsl-snapshot";
const ANT4DOCBOOK_RUNTIME_CACHE_VERSION = "V0.10.0";

const TARGET_BY_FORMAT = {
  all: "docbook-all",
  html: "docbook-html",
  pdf: "docbook-pdf",
  validate: "docbook-validate"
};
function resolvePathArgument(rawValue, baseDir = repoRoot) {
  const trimmed = String(rawValue ?? "").trim();
  if (!trimmed) {
    return trimmed;
  }
  return path.isAbsolute(trimmed) ? trimmed : path.resolve(baseDir, trimmed);
}

function parseArgs(argv) {
  const config = {
    format: "all",
    antBin: process.env.ANT_BIN || "ant",
    buildFile: defaultBuildFile,
    ant4docbookHome: defaultAnt4DocbookHome,
    ant4docbookCacheHome: resolvePathArgument(
      process.env.ANT4DOCBOOK_CACHE_HOME || defaultAnt4DocbookCacheHome
    )
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
      config.buildFile = resolvePathArgument(arg.slice("--build-file=".length).trim());
      continue;
    }
    if (arg.startsWith("--ant4docbook-home=")) {
      config.ant4docbookHome = resolvePathArgument(arg.slice("--ant4docbook-home=".length).trim());
      continue;
    }
    if (arg.startsWith("--ant4docbook-cache-home=")) {
      config.ant4docbookCacheHome = resolvePathArgument(
        arg.slice("--ant4docbook-cache-home=".length).trim()
      );
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

async function pathExists(candidatePath) {
  try {
    await fs.access(candidatePath);
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
      "  --ant4docbook-cache-home=<path>    ant4docbook cache home (default: ANT4DOCBOOK_CACHE_HOME or ~/.ant4docbook)",
      "  --help, -h                         Show this help"
    ].join("\n")
  );
}
async function createCompatibilityNestedPath(versionRoot) {
  const nestedRoot = path.join(versionRoot, DOCBOOK_XSL_VERSION);
  if (process.platform === "win32") {
    await fs.symlink(versionRoot, nestedRoot, "junction");
    return;
  }
  await fs.symlink(".", nestedRoot, "dir");
}

async function cloneDocbookTree(sourceRoot, destinationRoot) {
  await fs.mkdir(destinationRoot, { recursive: true });
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === DOCBOOK_XSL_VERSION) {
      continue;
    }
    await fs.cp(path.join(sourceRoot, entry.name), path.join(destinationRoot, entry.name), {
      recursive: true
    });
  }
}


async function runCommand(command, args, options = {}) {
  const isWindows = process.platform === "win32";
  const resolvedCommand = isWindows ? "cmd.exe" : command;
  const resolvedArgs = isWindows ? ["/d", "/s", "/c", command, ...args] : args;
  const cwd = options.cwd || repoRoot;
  const stdio = options.stdio || "ignore";

  await new Promise((resolve, reject) => {
    const child = spawn(resolvedCommand, resolvedArgs, {
      cwd,
      stdio
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Command terminated by signal ${signal}: ${command} ${args.join(" ")}`));
        return;
      }
      if ((code ?? 1) !== 0) {
        reject(new Error(`Command failed (${code}): ${command} ${args.join(" ")}`));
        return;
      }
      resolve();
    });
  });
}
async function ensureDocbookStylesheetCompatibility(config) {
  const cacheHome = config.ant4docbookCacheHome;
  const versionRoot = path.join(cacheHome, DOCBOOK_XSL_VERSION);
  const snapshotRoot = path.join(cacheHome, DOCBOOK_XSL_SNAPSHOT);
  const versionStylesheet = path.join(versionRoot, "xhtml", "docbook.xsl");
  const snapshotStylesheet = path.join(snapshotRoot, "xhtml", "docbook.xsl");
  const nestedRoot = path.join(versionRoot, DOCBOOK_XSL_VERSION);
  const nestedStylesheet = path.join(nestedRoot, "xhtml", "docbook.xsl");

  await fs.mkdir(cacheHome, { recursive: true });

  if (!(await pathExists(versionStylesheet)) && (await pathExists(snapshotStylesheet))) {
    console.log(
      JSON.stringify({
        event: "docbook-xsl-cache-promote-snapshot",
        ts: new Date().toISOString(),
        source: snapshotRoot,
        destination: versionRoot
      })
    );
    await fs.rm(versionRoot, { recursive: true, force: true });
    await fs.cp(snapshotRoot, versionRoot, { recursive: true });
  }

  if (!(await pathExists(versionStylesheet))) {
    return;
  }

  if (!(await pathExists(nestedStylesheet))) {
    await fs.rm(nestedRoot, { recursive: true, force: true });
    try {
      await createCompatibilityNestedPath(versionRoot);
    } catch (error) {
      console.log(
        JSON.stringify({
          event: "docbook-xsl-cache-compat-fallback-copy",
          ts: new Date().toISOString(),
          reason: error instanceof Error ? error.message : String(error)
        })
      );
      await cloneDocbookTree(versionRoot, nestedRoot);
    }
  }

  if (!(await pathExists(nestedStylesheet))) {
    throw new Error(
      `DocBook stylesheet cache is present but incompatible at ${versionRoot}. Missing ${nestedStylesheet}.`
    );
  }
}

async function ensureAnt4DocbookRuntimeCache(config) {
  const cacheHome = config.ant4docbookCacheHome;
  const runtimeRoot = path.join(cacheHome, ANT4DOCBOOK_RUNTIME_CACHE_VERSION);
  const runtimeStylesheet = path.join(runtimeRoot, "css", "jbossorg.css");
  if (await pathExists(runtimeStylesheet)) {
    return;
  }

  const ant4docbookJar = path.join(config.ant4docbookHome, "ant4docbook-0.10.0.jar");
  if (!(await pathExists(ant4docbookJar))) {
    return;
  }

  const jarExists = await commandExists("jar");
  if (!jarExists) {
    return;
  }

  await fs.mkdir(runtimeRoot, { recursive: true });
  await runCommand("jar", ["xf", ant4docbookJar], { cwd: runtimeRoot });

  if (!(await pathExists(runtimeStylesheet))) {
    throw new Error(
      `Failed to provision ant4docbook runtime cache at ${runtimeRoot}. Missing ${runtimeStylesheet}.`
    );
  }
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
      ant4docbook_cache_home: config.ant4docbookCacheHome,
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
  await ensureDocbookStylesheetCompatibility(config);
  await ensureAnt4DocbookRuntimeCache(config);
  await runAnt(config);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
