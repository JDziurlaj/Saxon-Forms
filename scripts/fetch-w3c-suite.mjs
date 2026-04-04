#!/usr/bin/env node
/**
 * Fetch the W3C XForms 1.1 Test Suite and extract into public-test/w3c-suite/
 *
 * Usage:
 *   node scripts/fetch-w3c-suite.mjs           # skips if already present
 *   node scripts/fetch-w3c-suite.mjs --force   # re-downloads and replaces
 */

import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const ZIP_URL = "https://www.w3.org/MarkUp/Forms/Test/XForms1.1/Edition1/zip/TestCases11.zip";
const STRIP_PREFIX = ["Test", "XForms1.1", "Edition1"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const targetDir = path.join(projectRoot, "public-test", "w3c-suite");

const force = process.argv.slice(2).includes("--force");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: "pipe" });
  if (result.error) {
    throw new Error(`Failed to run ${command}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = String(result.stderr || "").trim();
    throw new Error(
      `Command failed (${result.status}): ${command} ${args.join(" ")}${stderr ? `\n${stderr}` : ""}`
    );
  }
}

function quotePowerShellLiteral(input) {
  return `'${input.replace(/'/g, "''")}'`;
}

function extractZip(zipPath, destination) {
  if (process.platform === "win32") {
    const script = `Expand-Archive -LiteralPath ${quotePowerShellLiteral(zipPath)} -DestinationPath ${quotePowerShellLiteral(destination)} -Force`;
    const attempts = ["powershell", "pwsh"];
    let lastError = null;
    for (const command of attempts) {
      const result = spawnSync(
        command,
        ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script],
        { encoding: "utf8", stdio: "pipe" }
      );
      if (!result.error && result.status === 0) return;
      const stderr = String(result.stderr || result.stdout || "").trim();
      lastError = result.error
        ? new Error(`Failed to run ${command}: ${result.error.message}`)
        : new Error(
            `Command failed (${result.status}): ${command} -NoLogo -NoProfile -NonInteractive -Command ...${stderr ? `\n${stderr}` : ""}`
          );
    }
    throw lastError ?? new Error("Unable to extract zip archive on Windows.");
  }

  run("unzip", ["-q", "-o", zipPath, "-d", destination]);
}

function moveStrippedContent(destination) {
  const sourceRoot = path.join(destination, ...STRIP_PREFIX);
  if (!fs.existsSync(sourceRoot)) return;

  for (const entry of fs.readdirSync(sourceRoot)) {
    fs.renameSync(path.join(sourceRoot, entry), path.join(destination, entry));
  }
  fs.rmSync(path.join(destination, "Test"), { recursive: true, force: true });
}

function countXhtmlFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;

  let count = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      count += countXhtmlFiles(fullPath);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".xhtml")) {
      count += 1;
    }
  }
  return count;
}

async function downloadArchive(destinationPath) {
  const response = await fetch(ZIP_URL);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status} ${response.statusText})`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destinationPath, bytes);
}

async function main() {
  if (fs.existsSync(path.join(targetDir, "Chapt02")) && !force) {
    console.log(`W3C test suite already present in ${targetDir} (use --force to refresh)`);
    return;
  }

  console.log("Downloading W3C XForms 1.1 Test Suite...");
  const tmpZip = path.join(os.tmpdir(), `TestCases11.${process.pid}.${Date.now()}.zip`);

  try {
    await downloadArchive(tmpZip);

    if (fs.existsSync(targetDir)) {
      console.log(`Cleaning existing ${targetDir}...`);
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });

    console.log(`Extracting to ${targetDir}...`);
    extractZip(tmpZip, targetDir);
    moveStrippedContent(targetDir);

    const xhtmlCount = countXhtmlFiles(targetDir);
    console.log(`W3C test suite extracted successfully (${xhtmlCount} xhtml files)`);
  } finally {
    fs.rmSync(tmpZip, { force: true });
  }
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
