#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const sampleCompilations = [
  {
    name: "sample2",
    stylesheetPath: "samples/sample2/sample2.xsl",
    exportPath: "samples/sample2/sample2.sef.xml"
  },
  {
    name: "sample3",
    stylesheetPath: "samples/sample3/xsl/sample3.xsl",
    exportPath: "samples/sample3/sef/sample3.sef.xml"
  }
];

function runXslt3(args) {
  const isWindows = process.platform === "win32";
  const command = isWindows ? "cmd.exe" : "npx";
  const commandArgs = isWindows
    ? ["/d", "/s", "/c", "npx", "xslt3", ...args]
    : ["xslt3", ...args];

  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: repoRoot,
      stdio: "inherit"
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`xslt3 exited with code ${code ?? "unknown"}.`));
    });
  });
}

async function main() {
  for (const compilation of sampleCompilations) {
    console.log(`Compiling ${compilation.name} with xslt3...`);
    await runXslt3([
      "-t",
      `-xsl:${compilation.stylesheetPath}`,
      `-export:${compilation.exportPath}`,
      "-nogo",
      "-ns:##html5"
    ]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
