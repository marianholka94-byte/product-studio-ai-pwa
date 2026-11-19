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


const ownedProduct = worker.match(/async function ownedProduct[\\s\\S]*?\\n}/)?.[0] || "";
const ownedProject = worker.match(/async function ownedProject[\\s\\S]*?\\n}/)?.[0] || "";
assert.ok(/WHERE id = \\? AND user_id = \\?/.test(ownedProduct), "Product lookup must be scoped by both ID and authenticated user");
assert.ok(/WHERE id = \\? AND user_id = \\?/.test(ownedProject), "Project lookup must be scoped by both ID and authenticated user");
assert.ok(/WHERE id = \\? AND user_id = \\? AND deleted_at IS NULL/.test(worker), "Private asset lookup must enforce owner and active state");
assert.ok(/users\\/\\$\\{user\\.id\\}\\/products\\/\\$\\{productId\\}/.test(worker), "R2 object keys must be namespaced by authenticated user and product");
assert.ok(/sessions s JOIN users u ON u\\.id = s\\.user_id/.test(worker), "Session lookup must resolve its account from the server-side session record");
assert.ok(/s\\.revoked_at IS NULL AND s\\.expires_at > \\? AND u\\.status = 'active'/.test(worker), "Session lookup must reject revoked, expired, or inactive accounts");
assert.ok(/ALLOWED_ORIGINS\\.has\\(origin\\)/.test(worker), "Worker must reject origins outside the allowlist");
assert.ok(/sessionStorage\\.removeItem\\(TOKEN_KEY\\)/.test(cloud), "Logout and expired sessions must clear the cloud token");

console.log("Commercial cloud integration contract checks passed.");
