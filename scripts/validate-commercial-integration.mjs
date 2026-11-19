import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const worker = readFileSync("worker-preview.js", "utf8");
const cloud = readFileSync("cloud-library.js", "utf8");
const html = readFileSync("index.html", "utf8");

for (const route of [
  "/api/auth/register", "/api/auth/login", "/api/auth/me", "/api/auth/logout",
  "/api/products", "/api/projects", "/api/assets/"
]) assert.ok(worker.includes(route), "Missing Worker route: " + route);

for (const method of ["POST", "GET", "PATCH", "DELETE"]) {
  assert.ok(worker.includes('request.method === "' + method + '"'), "Missing HTTP method handling: " + method);
}
for (const apiPath of [
  "/api/auth/login", "/api/auth/register", "/api/auth/me", "/api/auth/logout",
  "/api/products", "/api/projects"
]) assert.ok(cloud.includes(apiPath), "Cloud UI does not call " + apiPath);

assert.ok(html.includes("/cloud-library.js?"), "Main PWA does not load the cloud library module");
assert.ok(cloud.includes("sessionStorage"), "Cloud session token must use sessionStorage");
assert.ok(!cloud.includes("localStorage"), "Cloud session token must not use localStorage");
assert.ok(cloud.includes("Authorization"), "Cloud requests must use bearer authentication");
assert.ok(cloud.includes("method: isEditing ? \"PATCH\" : \"POST\""), "Cloud UI must support updates");
assert.ok(cloud.includes('method: "DELETE"'), "Cloud UI must support archive operations");
assert.ok(worker.includes("ALLOWED_ORIGINS"), "Worker must enforce an origin allowlist");
assert.ok(worker.includes("user.id"), "Worker must scope library operations to the authenticated account");

console.log("Commercial cloud integration contract checks passed.");
