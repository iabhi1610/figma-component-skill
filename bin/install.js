#!/usr/bin/env node
// Copies the skill into a skills folder.
//   npx @iabhi1610/figma-component-skill            -> ./.claude/skills (this project)
//   npx @iabhi1610/figma-component-skill --global   -> ~/.claude/skills (every project)
//   npx @iabhi1610/figma-component-skill --dir PATH -> PATH
const fs = require("fs");
const path = require("path");
const os = require("os");

const NAME = "figma-component-script";
const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) {
  console.log("Usage: npx @iabhi1610/figma-component-skill [--global | --dir <skills folder>]");
  process.exit(0);
}
let base = path.join(process.cwd(), ".claude", "skills");
if (args.includes("--global")) base = path.join(os.homedir(), ".claude", "skills");
const d = args.indexOf("--dir");
if (d !== -1) {
  if (!args[d + 1]) { console.error("--dir needs a folder"); process.exit(1); }
  base = path.resolve(args[d + 1]);
}
const src = path.join(__dirname, "..", "skills", NAME);
const dest = path.join(base, NAME);
fs.mkdirSync(base, { recursive: true });
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log("Installed " + NAME + " to " + dest);
console.log('Restart your agent, then ask: "Make a Figma button component with the figma-component-script skill."');
