import { readFileSync } from "node:fs";
import { Script } from "node:vm";

const html = readFileSync("index.html", "utf8");
const inlineScripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .filter(source => source.trim());

for (let index = 0; index < inlineScripts.length; index++) {
  new Script(inlineScripts[index], { filename: "index.html:inline-script-" + (index + 1) });
}
for (const path of ["cloud-library.js", "app-navigation.js", "sw.js"]) {
  new Script(readFileSync(path, "utf8"), { filename: path });
}

console.log("PWA app shell syntax passed: inline HTML scripts, cloud library, navigation, and service worker.");
