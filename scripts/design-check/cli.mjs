#!/usr/bin/env node
// Usage: node scripts/design-check/cli.mjs <file-or-url> [--tokens <css file>] [--json] [--allow-network]
// Exits 1 if any error finding exists, 2 on a usage or browser failure.
import fs from "node:fs";
import { collect } from "./collect.mjs";
import { runRules, parseTokens } from "./rules.mjs";

function usage() {
  console.error("Usage: node scripts/design-check/cli.mjs <file-or-url> [--tokens <css file>] [--json] [--allow-network]");
  process.exit(2);
}

const args = process.argv.slice(2);
let target = null;
let tokensPath = null;
let asJson = false;
let allowNetwork = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--tokens") tokensPath = args[++i];
  else if (a === "--json") asJson = true;
  else if (a === "--allow-network") allowNetwork = true;
  else if (a.startsWith("--")) usage();
  else target = a;
}
if (!target) usage();

let tokens = null;
if (tokensPath) {
  try {
    tokens = parseTokens(fs.readFileSync(tokensPath, "utf8"));
  } catch (err) {
    console.error(`Cannot read tokens file: ${err.message}`);
    process.exit(2);
  }
}

let snapshot;
try {
  snapshot = await collect(target, { allowNetwork });
} catch (err) {
  console.error(`Could not open the page: ${err.message}`);
  console.error("Set DESIGN_CHECK_CHROMIUM to a Chromium binary, or install one for playwright-core.");
  process.exit(2);
}

const findings = runRules(snapshot, { tokens });
const errors = findings.filter((f) => f.severity === "error");
const warns = findings.filter((f) => f.severity === "warn");

if (asJson) {
  console.log(JSON.stringify({ target, errors: errors.length, warnings: warns.length, findings }, null, 2));
} else {
  const lines = [];
  lines.push(`Design check: ${target}`);
  lines.push(`Viewports 1440x900 and 390x844. ${errors.length} error rules, ${warns.length} warning rules.`);
  lines.push("");
  const order = [...errors, ...warns];
  for (const f of order) {
    lines.push(`${f.severity.toUpperCase()} ${f.id} (${f.count})`);
    lines.push(`  ${f.message}`);
    for (const ex of f.examples) lines.push(`  - ${ex}`);
    lines.push("");
  }
  if (!order.length) lines.push("No findings.");
  lines.push(errors.length ? "Result: FAIL" : "Result: pass");
  console.log(lines.join("\n"));
}
process.exit(errors.length ? 1 : 0);
